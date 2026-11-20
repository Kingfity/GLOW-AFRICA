import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { GoogleGenAI, Type } from '@google/genai';
import {
  sanitizeAssistantResult,
  validateAssistantMessage,
  validateVillageContribution,
} from '../src/utils/careTools.ts';
import {
  findKenyaCounty,
  validateEmergencyAuthorityAlert,
} from '../src/utils/kenyaCounties.ts';
import { validateStoryAnimationInput } from '../src/utils/specialNeedsGuide.ts';
import {
  clearSessionCookie,
  getSessionFromRequest,
  isAdminAuthConfigured,
  requireAdmin,
  setSessionCookie,
  verifyCredentials,
  type AuthenticatedRequest,
} from './auth.ts';
import {
  BoundedRateLimiter,
  buildSecurityHeaders,
  containsEmbeddedScriptSignature,
  inspectPayloadForThreats,
  isAllowedMutationOrigin,
  isBlockedScannerPath,
  verifyImageMagicBytes,
} from './security.ts';
import {
  generateId,
  getPublicSiteData,
  readDatabase,
  writeDatabase,
} from './store.ts';
import {
  cleanText,
  isHoneypotTriggered,
  normalizeEventCategory,
  slugify,
  validateAsdSupportRequest,
  validateContactMessage,
  validateCounsellingRequest,
  validateEventRegistration,
  validateHomeVisitBooking,
  validatePartnerOnboarding,
  validatePrayerRequest,
  validateRehabReferral,
  validateSafeHomeRequest,
  validateSpecialNeedsSupport,
  validateVolunteerEnquiry,
} from '../src/utils/validation.ts';
import type {
  AdministratorDeskProfile,
  Announcement,
  ChildrensHome,
  EventCategory,
  EventItem,
  ImpactCategory,
  ImpactProject,
  RehabFacility,
  SiteSettings,
} from '../src/shared/types.ts';

export const UPLOADS_DIR = process.env.VERCEL
  ? path.join('/tmp', 'hisandhers-uploads')
  : path.resolve(process.cwd(), 'public', 'uploads');
export const VIDEOS_DIR = path.resolve(process.cwd(), 'public', 'videos');

const apiRateLimiter = new BoundedRateLimiter();
const loginFailureLimiter = new BoundedRateLimiter();

function checkRateLimit(ip: string, maxRequests = 20, windowMs = 60_000): boolean {
  return apiRateLimiter.check(`route:${ip}`, maxRequests, windowMs);
}

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

export const isPrivacyHardenedPath = (reqPath: string) =>
  reqPath === '/gbv' ||
  reqPath.startsWith('/gbv/') ||
  reqPath === '/recovery' ||
  reqPath.startsWith('/recovery/');

export const applyPrivacyHeaders = (res: express.Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
};

export const hardenIsolatedHtml = (html: string): string => {
  const stripped = html
    .replace(/<link[^>]*href=["']https:\/\/fonts\.(googleapis|gstatic)\.com[^"']*["'][^>]*\/?>/gi, '')
    .replace(/<script[^>]*google-analytics|googletagmanager|gtag[^>]*>[\s\S]*?<\/script>/gi, '');
  const noCacheMeta = [
    '<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />',
    '<meta http-equiv="Pragma" content="no-cache" />',
    '<meta http-equiv="Expires" content="0" />',
  ].join('\n    ');
  return stripped.replace('<head>', `<head>\n    ${noCacheMeta}`);
};

export function createApiApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Layer 1: Security Headers & Exploit Scanner Blocker Firewall
  app.use((req, res, next) => {
    if (isBlockedScannerPath(req.path)) {
      res.status(403).json({ error: 'Access denied by application firewall.' });
      return;
    }

    const isHttps =
      req.secure ||
      req.headers['x-forwarded-proto'] === 'https' ||
      Boolean(process.env.VERCEL);
    const isPrivacy = isPrivacyHardenedPath(req.path);
    const secHeaders = buildSecurityHeaders({ isHttps, isPrivacyIsolated: isPrivacy });
    for (const [k, v] of Object.entries(secHeaders)) {
      res.setHeader(k, v);
    }
    next();
  });

  app.use(express.json({ limit: '6mb' }));

  // Layer 2: API Flood Protection, CSRF Origin Guard & Anti-Injection Payload Firewall
  app.use('/api', (req, res, next) => {
    const ip = req.ip || 'unknown';
    if (!apiRateLimiter.check(`global:${ip}`, 120, 60_000)) {
      res.status(429).json({ error: 'Rate limit exceeded. Please pause briefly and try again.' });
      return;
    }

    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
    if (isMutation) {
      if (!isAllowedMutationOrigin(req.headers.origin, req.headers.host, process.env.APP_URL)) {
        res.status(403).json({ error: 'Request origin rejected by CSRF firewall.' });
        return;
      }
      if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
        const contentType = String(req.headers['content-type'] || '').toLowerCase();
        if (contentType && !contentType.includes('application/json')) {
          res.status(415).json({ error: 'Unsupported media type. JSON payload required.' });
          return;
        }
      }
    }

    const queryCheck = inspectPayloadForThreats(req.query, { skipImageBase64: false });
    if (!queryCheck.safe) {
      res.status(400).json({ error: 'Unsafe query parameters rejected by application firewall.' });
      return;
    }

    if (req.body && typeof req.body === 'object') {
      const bodyCheck = inspectPayloadForThreats(req.body, { skipImageBase64: true });
      if (!bodyCheck.safe) {
        res.status(400).json({ error: 'Potentially unsafe input rejected by security firewall.' });
        return;
      }
    }

    next();
  });

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'public, max-age=86400');
      },
    })
  );
  if (fs.existsSync(VIDEOS_DIR)) {
    app.use('/videos', express.static(VIDEOS_DIR));
  }

  // Browser public configuration (Maps key injected at runtime without hardcoding)
  app.get('/api/public-config', (_req, res) => {
    res.json({
      mapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
    });
  });

  // Public site data
  app.get('/api/public-data', (_req, res) => {
    res.json(getPublicSiteData());
  });

  // Server-side AI Care Guide Chatbot (/api/care-assistant)
  app.post('/api/care-assistant', async (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 20, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please pause briefly before sending another question.' });
      return;
    }

    const validated = validateAssistantMessage(req.body?.message);
    if (!validated.valid) {
      res.status(400).json({ error: validated.error });
      return;
    }

    const geminiClient = createGeminiClient();
    if (!geminiClient) {
      res.status(503).json({
        error:
          'Care Guide AI is temporarily unavailable while the Gemini API key is being configured. Please use the Care Family Compass cards or Contact page to reach us directly.',
      });
      return;
    }

    const publicData = getPublicSiteData();
    const homesSummary = publicData.childrensHomes
      .map((h) => `${h.name} (${h.countyRegion}, ${h.townArea}; needs: ${h.currentNeeds.join(', ')})`)
      .join('; ');
    const rehabSummary = publicData.rehabFacilities
      .map((f) => `${f.name} (${f.countyRegion}, ${f.focusType}, ${f.careFormat})`)
      .join('; ');
    const traumaGuideSummary = publicData.asdGuides
      .map((g) => `${g.pillar}: ${g.title}`)
      .join('; ');

    const historyItems = Array.isArray(req.body?.history)
      ? req.body.history
          .slice(-6)
          .map((item: { role?: unknown; text?: unknown }) => {
            const role = item?.role === 'assistant' ? 'Guide' : 'Visitor';
            const text = cleanText(item?.text, 350);
            return text ? `${role}: ${text}` : '';
          })
          .filter(Boolean)
          .join('\n')
      : '';

    const systemInstruction = [
      'You are the warm, compassionate His & Hers Circle of Hope Care Guide.',
      'Established in 2025 in Ruiru, Kiambu County, our community-based organisation connects neighbours across Kenya (and East Africa) so no elder, parent, youth, or household carries silent hardship alone.',
      'Available routes (ONLY recommend href values from this exact list):',
      '- /home-visits: Book individuals, friend groups, or corporate CSR teams to visit verified Children’s Homes & Schools for the Differently Abled across Kenya.',
      '- /special-needs-families: Dedicated hub for Single-Parent & Two-Parent families raising children or dependants with disabilities—talking directly with mothers and guardians in charge, offering support kits, practical daily care guides, and inclusive 47-county schools.',
      '- /partners: Institutional Partner, Foundation & Corporate Grant Dossier.',
      '- /rehabilitation: Search rehabilitation centres sorted by proximity and submit a confidential referral.',
      '- /mental-health: Mental Health, Trauma & Stress Healing Wing with an interactive 4-4-6 Trauma & Stress Grounding Planner, nervous-system reset steps, and confidential callbacks.',
      '- /counselling: Talk to a Counsellor, Lighten Your Burden (anonymous or callback), and 60-second breathing space.',
      '- /find-my-home: Discreet safe refuge & family protection coordination (with Quick Exit safety).',
      '- /recovery: Peer recovery voices & confidential community accompaniment.',
      '- /prayer-worship: Confidential prayer request & GLOW Prayer Movement fellowship details.',
      '- /events: Upcoming Children’s Home visit days, Trauma & Stress Circles, and the Nov 28 Christmas of Hope feast.',
      '- /leadership: Meet our conveners (Nancy Kariuki & GLOW Prayer Movement) and Administrators & Help Desk.',
      '- /get-involved: Volunteer and stewardship pathways.',
      '- /about: Our continuous Ruiru story since 2025, Ruiru Boys fellowship, and mission.',
      '- /contact: Direct contact channels.',
      `Current Partner Homes & Schools: ${homesSummary}`,
      `Current Rehabilitation Centres: ${rehabSummary}`,
      `Current Mental Health & Trauma Guides: ${traumaGuideSummary}`,
      'Guidelines: Be concise (2–4 gentle sentences), never invent fake phone numbers or addresses, never claim medical diagnoses, and if abuse or acute crisis is mentioned include urgentSafetyNote guiding them to /find-my-home or Kenyan emergency lines (999 / 112 / 1195 / 116).',
    ].join('\n');

    const promptContents = historyItems
      ? `Recent conversation:\n${historyItems}\n\nLatest visitor question: ${validated.message}`
      : validated.message;

    try {
      const response = await geminiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptContents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Warm, clear 2-4 sentence answer guiding the visitor.',
              },
              suggestedLinks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING, description: 'Short link button label' },
                    href: {
                      type: Type.STRING,
                      description: 'Exact route path from the allowed list starting with /',
                    },
                    reason: { type: Type.STRING, description: 'Brief 4-8 word reason why this helps' },
                  },
                },
              },
              urgentSafetyNote: {
                type: Type.STRING,
                description: 'Optional urgent safety note if violence, abuse, or emergency is mentioned.',
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(sanitizeAssistantResult(parsed));
    } catch (err) {
      console.error('Gemini care-assistant error:', err);
      res.status(502).json({
        error:
          'Unable to reach Care Guide AI right now. Please try again in a moment or use the pathway cards on screen.',
      });
    }
  });

  // Live Google Maps & Google Search Grounded Kenyan Facility / Relief Guidance Finder
  app.post('/api/grounded-care-search', async (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 20, 60_000)) {
      res.status(429).json({ error: 'Too many searches right now. Please wait a brief moment.' });
      return;
    }

    const query = cleanText(req.body?.query, 300);
    const mode = req.body?.mode === 'places' ? 'places' : 'guidance';
    const county = cleanText(req.body?.county, 80) || 'Kiambu';
    if (!query || query.length < 3) {
      res.status(400).json({ error: 'Please enter at least 3 characters describing what help or facility you need.' });
      return;
    }

    const geminiClient = createGeminiClient();
    if (!geminiClient) {
      res.status(503).json({
        error: 'Live Search Grounding requires GEMINI_API_KEY to be configured on the server.',
      });
      return;
    }

    try {
      if (mode === 'places') {
        const countyInfo = findKenyaCounty(county);
        const lat = Number.isFinite(Number(req.body?.lat)) ? Number(req.body.lat) : countyInfo.lat;
        const lng = Number.isFinite(Number(req.body?.lng)) ? Number(req.body.lng) : countyInfo.lng;

        const response = await geminiClient.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `You are helping a person seeking urgent safe refuge, shelter, or protection near ${county} County (${countyInfo.capitalTown}), Kenya around coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}). Find real, verified places of refuge in Kenya matching: "${query}". Focus strictly on Gender-Based Violence Recovery Centres (GVRC), women's and children's safe refuge shelters, police station gender & children's protection desks, and 24-hour public hospital trauma/PRC clinics. Give concise, calm physical location context and practical safety reach info.`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: { latitude: lat, longitude: lng },
              },
            },
          },
        });

        const metadata = response.candidates?.[0]?.groundingMetadata as any;
        const chunks = Array.isArray(metadata?.groundingChunks) ? metadata.groundingChunks : [];
        const mapsChunks = chunks
          .filter((c: any) => c?.maps?.uri || c?.maps?.title)
          .map((c: any) => ({
            title: String(c.maps.title || 'Google Maps Place of Refuge'),
            uri: String(c.maps.uri || ''),
            placeId: c.maps.placeId ? String(c.maps.placeId) : undefined,
            snippets: Array.isArray(c.maps.placeAnswerSources?.reviewSnippets)
              ? c.maps.placeAnswerSources.reviewSnippets
                  .map((s: any) => String(s?.content || s?.text || ''))
                  .filter(Boolean)
                  .slice(0, 2)
              : [],
          }));

        res.json({
          mode: 'places',
          county: countyInfo.name,
          answer: response.text || 'Verified place of refuge details retrieved.',
          mapsChunks,
          webChunks: [],
          widgetToken: metadata?.googleMapsWidgetContextToken || null,
        });
        return;
      }

      const response = await geminiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `You are a practical Kenyan family support desk advisor for His & Hers Circle of Hope in ${county} County. Answer cleanly in concise, compassionate bullet points with real Kenyan public schemes (NCPWD disability registration & cash transfer, Ministry of Education EARC offices, SHA medical cover, KISE assessment, or county hospital rehabilitation clinics) for this caregiver question: "${query}"`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const metadata = response.candidates?.[0]?.groundingMetadata as any;
      const chunks = Array.isArray(metadata?.groundingChunks) ? metadata.groundingChunks : [];
      const webChunks = chunks
        .filter((c: any) => c?.web?.uri)
        .map((c: any) => ({
          title: String(c.web.title || c.web.uri),
          uri: String(c.web.uri),
        }));

      res.json({
        mode: 'guidance',
        county,
        answer: response.text || 'Live Kenyan caregiver guidance retrieved.',
        mapsChunks: [],
        webChunks,
        widgetToken: null,
      });
    } catch (err: any) {
      console.error('Grounded care search error:', err);
      const errStatus = Number(err?.status || err?.code);
      const errMsg = String(err?.message || '');
      if (errStatus === 429 || /RESOURCE_EXHAUSTED/i.test(errMsg)) {
        res.status(429).json({
          status: 'RESOURCE_EXHAUSTED',
          error: 'Google Maps grounding quota reached right now. Please browse our 47-county refuge hubs above or call 999 / 1195 / 116.',
        });
        return;
      }
      res.status(502).json({
        error: 'Could not reach live Google grounding right now. Please try again shortly or use our verified 47-county protection directory.',
      });
    }
  });

  // Animate real community photographs into calm video stories (gemini-omni-1.2-flash Interactions API)
  app.post('/api/animate-story-video', async (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 6, 60_000)) {
      res.status(429).json({ error: 'Please wait a minute before generating another video keepsake.' });
      return;
    }

    const rawPrompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const aspectRatio = req.body?.aspectRatio === '9:16' ? '9:16' : '16:9';
    const validated = validateStoryAnimationInput({
      dataUrl: req.body?.imageDataUrl || '',
      prompt: rawPrompt,
      aspectRatio,
    });
    if (!validated.valid || !validated.mimeType || !validated.base64Data) {
      res.status(400).json({ error: validated.error || 'Invalid video animation input.' });
      return;
    }

    const mimeType = validated.mimeType;
    const base64Data = validated.base64Data;
    const imageExt = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const imageBuffer = Buffer.from(base64Data, 'base64');
    if (
      !verifyImageMagicBytes(imageBuffer, imageExt) ||
      containsEmbeddedScriptSignature(imageBuffer)
    ) {
      res.status(400).json({
        error: 'Uploaded image failed binary anti-malware signature verification. Use a clean PNG, JPG, or WEBP photograph.',
      });
      return;
    }

    const geminiClient = createGeminiClient();
    if (!geminiClient) {
      res.status(503).json({
        code: 'PAID_KEY_OR_BILLING_REQUIRED',
        error:
          'Video story animation requires a billing-enabled GEMINI_API_KEY configured in server environment variables.',
      });
      return;
    }

    try {
      const interaction = await (geminiClient as any).interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          input: [
            { type: 'image', mime_type: mimeType, data: base64Data },
            {
              type: 'text',
              text: `${rawPrompt}. Natural lifelike documentary motion, warm sunlit realism, gentle movement only, no artificial CGI artifacts.`,
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: aspectRatio,
            duration: '6s',
            resolution: '720p',
          },
        },
        { timeout: 300000 }
      );

      const outputs = Array.isArray(interaction?.outputs) ? interaction.outputs : [];
      const videoOut = outputs.find(
        (o: any) =>
          o?.type === 'video' || (typeof o?.mime_type === 'string' && o.mime_type.startsWith('video/'))
      );

      if (!videoOut) {
        res.status(502).json({
          code: 'VIDEO_GENERATION_FAILED',
          error: 'No video output was returned for this photograph. Try a clearer community photo and a calmer motion prompt.',
        });
        return;
      }

      const outMime = videoOut.mime_type || 'video/mp4';
      if (videoOut.data) {
        if (!process.env.VERCEL) {
          const filename = `story-reel-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.mp4`;
          fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(videoOut.data, 'base64'));
          res.status(201).json({
            videoUrl: `/uploads/${filename}`,
            aspectRatio,
            mimeType: outMime,
          });
          return;
        }
        res.status(201).json({
          videoUrl: `data:${outMime};base64,${videoOut.data}`,
          aspectRatio,
          mimeType: outMime,
        });
        return;
      }

      if (videoOut.uri) {
        res.status(201).json({
          videoUrl: String(videoOut.uri),
          aspectRatio,
          mimeType: outMime,
        });
        return;
      }

      res.status(502).json({
        code: 'VIDEO_GENERATION_FAILED',
        error: 'Video output was empty. Please try again with a different photo.',
      });
    } catch (err: any) {
      console.error('Animate story video error:', err);
      const status = Number(err?.status || err?.code) || 502;
      const msg = String(err?.message || '');
      if (
        status === 402 ||
        status === 403 ||
        /billing|quota|permission|paid|api key/i.test(msg)
      ) {
        res.status(402).json({
          code: 'PAID_KEY_OR_BILLING_REQUIRED',
          error:
            'Animating community photos requires a billing-enabled Gemini API key in GEMINI_API_KEY (or Vercel Environment Variables). Please verify billing for gemini-omni-1.2-flash and try again.',
        });
        return;
      }
      res.status(502).json({
        code: 'VIDEO_GENERATION_FAILED',
        error: 'Unable to animate this photograph right now. Please try again shortly.',
      });
    }
  });

  // Public submission: Prayer Request
  app.post('/api/prayer-requests', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validatePrayerRequest(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please review the highlighted fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.prayerRequests.unshift({
      id: generateId('pray'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message: 'Your prayer request has been received privately by our care and prayer team.',
    });
  });

  // Public submission: Talk to a Counsellor / Mental Health Space (Lighten Your Burden)
  app.post('/api/counselling-requests', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateCounsellingRequest(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please review the highlighted fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.counsellingRequests.unshift({
      id: generateId('cnsl'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message:
        validation.data.isAnonymous
          ? 'Thank you for sharing what you are carrying. Your burden is heard in strict confidence.'
          : 'Your confidential counselling request has been received. A counsellor or trained care coordinator will reach out via your chosen method.',
    });
  });

  // Public submission: Find My Home (Safe Refuge for GBV & Child Abuse)
  app.post('/api/safe-home-requests', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateSafeHomeRequest(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please complete the required safety details.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.safeHomeRequests.unshift({
      id: generateId('safe'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message:
        'Your safe refuge request has been logged confidentially. Our protection desk will follow your safe contact instructions carefully.',
    });
  });

  // Public submission: Book a Children's Home Visit
  app.post('/api/home-visits', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateHomeVisitBooking(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please review the highlighted fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.homeVisitBookings.unshift({
      id: generateId('visit'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message: `Your visit request for ${validation.data.selectedHomeName} has been logged. Our partnership liaison will coordinate safeguarding briefing, children’s home confirmation, and supplies checklist.`,
    });
  });

  // Public submission: Corporate / NGO / Foundation / Sponsor Onboarding
  app.post('/api/partner-onboarding', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validatePartnerOnboarding(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please complete the organisation details.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.partnerOrganizations.unshift({
      id: generateId('part'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message: `Thank you. ${validation.data.organizationName} has been submitted to our Partner Network & Grants desk for collaboration onboarding.`,
    });
  });

  // Public submission: Rehabilitation Facility Referral Request
  app.post('/api/rehab-referrals', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateRehabReferral(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please check the highlighted fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.rehabReferrals.unshift({
      id: generateId('rehab'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message: `Your confidential referral request for ${validation.data.chosenFacilityName} has been received. A recovery coordinator will reach out discreetly.`,
    });
  });

  // Public submission: Mental Health, Trauma & Stress Care Support Request
  app.post('/api/asd-support', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateAsdSupportRequest(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please review the highlighted fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.asdSupportRequests.unshift({
      id: generateId('mh'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message:
        'Thank you for reaching out to our Mental Health & Trauma Care Desk. A trained counsellor and peer listener will follow up gently with confidential support.',
    });
  });

  // Public submission: Special Needs Kids & Families (Mother / Guardian Direct Support)
  app.post('/api/special-needs-support', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateSpecialNeedsSupport(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please review the highlighted fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.specialNeedsRequests.unshift({
      id: generateId('snf'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message: `Karibu sana, ${validation.data.guardianName}. Our Mother & Guardian Care Lead has received your note for your ${validation.data.householdStructure.toLowerCase()} and will connect via ${validation.data.preferredContactMethod}.`,
    });
  });

  // Public submission: Volunteer / Get Involved Enquiry
  app.post('/api/volunteers', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateVolunteerEnquiry(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please complete all required fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.volunteerEnquiries.unshift({
      id: generateId('vol'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message: 'Thank you for stepping forward to serve. Our coordination team will connect with you.',
    });
  });

  // Public submission: Contact Message
  app.post('/api/contact', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 15, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateContactMessage(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please complete all required fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    db.contactMessages.unshift({
      id: generateId('msg'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message: 'Thank you for reaching out to His & Hers Circle of Hope. We will respond as soon as possible.',
    });
  });

  // Public submission: Event Registration / RSVP
  app.post('/api/event-registrations', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 20, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateEventRegistration(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please check your registration details.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    const event = db.events.find((e) => e.id === validation.data?.eventId);
    if (!event) {
      res.status(404).json({ error: 'Selected gathering could not be found.' });
      return;
    }

    db.eventRegistrations.unshift({
      id: generateId('reg'),
      eventId: event.id,
      eventTitle: event.title,
      fullName: validation.data.fullName,
      email: validation.data.email,
      phone: validation.data.phone,
      attendeesCount: validation.data.attendeesCount,
      notes: validation.data.notes,
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message: `Your place is noted for ${event.title}. We look forward to welcoming you.`,
    });
  });

  // Public submission: Care Family Village Builder contribution pledge
  app.post('/api/contributions', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 20, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please pause briefly before pledging again.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateVillageContribution(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please check the highlighted fields.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    const newEntry = {
      id: generateId('vc'),
      ...validation.data,
      createdAt: new Date().toISOString(),
    };
    db.villageContributions.unshift(newEntry);
    writeDatabase(db);
    res.status(201).json({
      received: true,
      contribution: newEntry,
      villageContributions: db.villageContributions,
      message: `Thank you, ${newEntry.contributorName}! Your ${newEntry.tierLabel} (${newEntry.units}x) just lit up our Care Family Village.`,
    });
  });

  // Public submission: Regional Emergency Authority Alert (47 Counties)
  app.post('/api/emergency-alerts', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip, 25, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Call 999 / 112 or 1195 immediately if in danger.' });
      return;
    }
    if (isHoneypotTriggered(req.body?.website_url)) {
      res.status(201).json({ received: true });
      return;
    }

    const validation = validateEmergencyAuthorityAlert(req.body || {});
    if (!validation.valid || !validation.data) {
      res.status(400).json({ error: 'Please complete your location and safe contact details.', errors: validation.errors });
      return;
    }

    const db = readDatabase();
    const countyInfo = findKenyaCounty(validation.data.county);
    const alertRecord = {
      id: generateId('emg'),
      ...validation.data,
      status: 'dispatched' as const,
      createdAt: new Date().toISOString(),
    };
    db.emergencyAlerts.unshift(alertRecord);
    writeDatabase(db);

    res.status(201).json({
      received: true,
      alert: alertRecord,
      localAuthorities: {
        county: countyInfo.name,
        police: countyInfo.emergencyPolice,
        childProtection: countyInfo.childProtectionDesk,
        gbvDesk: countyInfo.gbvDesk,
      },
      message: `Regional alert logged for ${countyInfo.name} County (${validation.data.authorityTarget}). Direct hotlines: 999 / 112 (Police), 1195 (GBV), 116 (Childline).`,
    });
  });

  // Admin Authentication Routes
  app.get('/api/admin/session', (req, res) => {
    const user = getSessionFromRequest(req);
    res.json({ authenticated: Boolean(user), user });
  });

  app.post('/api/admin/login', (req, res) => {
    if (!isAdminAuthConfigured()) {
      res.status(503).json({
        error:
          'CMS login requires ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SECRET to be configured in server environment variables.',
      });
      return;
    }

    const ip = req.ip || 'unknown';
    const loginKey = `login-fail:${ip}`;
    if (!loginFailureLimiter.check(loginKey, 5, 15 * 60_000)) {
      res.setHeader('Retry-After', '900');
      res.status(429).json({
        error: 'Too many failed sign-in attempts. Please wait 15 minutes before trying again.',
      });
      return;
    }

    const email = cleanText(req.body?.email, 160);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const user = verifyCredentials(email, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid administrator email or password.' });
      return;
    }

    loginFailureLimiter.reset(loginKey);
    setSessionCookie(req, res, user);
    res.json({ authenticated: true, user });
  });

  app.post('/api/admin/logout', (req, res) => {
    clearSessionCookie(req, res);
    res.json({ authenticated: false });
  });

  // Protected Admin Submissions & Dashboard Data
  app.get('/api/admin/dashboard', requireAdmin, (_req: AuthenticatedRequest, res) => {
    const db = readDatabase();
    res.json({
      settings: db.settings,
      announcements: db.announcements,
      impactProjects: db.impactProjects,
      events: db.events,
      childrensHomes: db.childrensHomes,
      rehabFacilities: db.rehabFacilities,
      prayerRequests: db.prayerRequests,
      counsellingRequests: db.counsellingRequests,
      safeHomeRequests: db.safeHomeRequests,
      homeVisitBookings: db.homeVisitBookings,
      partnerOrganizations: db.partnerOrganizations,
      rehabReferrals: db.rehabReferrals,
      asdSupportRequests: db.asdSupportRequests,
      specialNeedsRequests: db.specialNeedsRequests,
      volunteerEnquiries: db.volunteerEnquiries,
      contactMessages: db.contactMessages,
      eventRegistrations: db.eventRegistrations,
      emergencyAlerts: db.emergencyAlerts,
      administrators: db.administrators,
    });
  });

  // Admin: Update Site Settings & Contact Information
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const db = readDatabase();
    const incoming = req.body as Partial<SiteSettings>;
    const updated: SiteSettings = {
      ...db.settings,
      organisationName: cleanText(incoming.organisationName, 120) || db.settings.organisationName,
      tagline: cleanText(incoming.tagline, 180) || db.settings.tagline,
      heroHeadline: cleanText(incoming.heroHeadline, 200) || db.settings.heroHeadline,
      heroSubheadline: cleanText(incoming.heroSubheadline, 600) || db.settings.heroSubheadline,
      welcomeHeadline: cleanText(incoming.welcomeHeadline, 200) || db.settings.welcomeHeadline,
      welcomeBody: cleanText(incoming.welcomeBody, 1200) || db.settings.welcomeBody,
      prayerInvitation: cleanText(incoming.prayerInvitation, 500) || db.settings.prayerInvitation,
      closingStatement: cleanText(incoming.closingStatement, 500) || db.settings.closingStatement,
      primaryLocationLabel:
        cleanText(incoming.primaryLocationLabel, 200) || db.settings.primaryLocationLabel,
      primaryAddress: cleanText(incoming.primaryAddress, 300) || db.settings.primaryAddress,
      gatheringScheduleSummary:
        cleanText(incoming.gatheringScheduleSummary, 250) || db.settings.gatheringScheduleSummary,
      contactEmail: cleanText(incoming.contactEmail, 160) || db.settings.contactEmail,
      contactPhone: cleanText(incoming.contactPhone, 60) || db.settings.contactPhone,
      whatsappNumber: cleanText(incoming.whatsappNumber, 40) || db.settings.whatsappNumber,
      emergencyHotlineNote:
        cleanText(incoming.emergencyHotlineNote, 500) || db.settings.emergencyHotlineNote,
      instagramUrl: cleanText(incoming.instagramUrl, 250),
      facebookUrl: cleanText(incoming.facebookUrl, 250),
      youtubeUrl: cleanText(incoming.youtubeUrl, 250),
      approvedGivingNote: cleanText(incoming.approvedGivingNote, 800) || db.settings.approvedGivingNote,
      updatedAt: new Date().toISOString(),
    };
    db.settings = updated;
    writeDatabase(db);
    res.json({ settings: updated });
  });

  // Admin: Upload Photograph (Magic-Byte & Polyglot Anti-Malware Verified)
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const dataUrl = typeof req.body?.dataUrl === 'string' ? req.body.dataUrl : '';
    const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Please upload a valid PNG, JPG, or WEBP image.' });
      return;
    }
    const ext = match[1] === 'jpeg' ? 'jpg' : (match[1] as 'png' | 'jpg' | 'webp');
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      res.status(400).json({ error: 'Uploaded image must be smaller than 4 MB.' });
      return;
    }
    if (!verifyImageMagicBytes(buffer, ext) || containsEmbeddedScriptSignature(buffer)) {
      res.status(400).json({
        error: 'Uploaded file failed binary image signature and anti-malware verification.',
      });
      return;
    }
    const filename = `care-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    res.status(201).json({ url: `/uploads/${filename}` });
  });

  // Admin: Events CRUD
  app.post('/api/admin/events', requireAdmin, (req, res) => {
    const title = cleanText(req.body?.title, 180);
    const category = cleanText(req.body?.category, 60) as EventCategory;
    const dateISO = cleanText(req.body?.dateISO, 20);
    const timeLabel = cleanText(req.body?.timeLabel, 80);
    const venue = cleanText(req.body?.venue, 200);
    const summary = cleanText(req.body?.summary, 400);
    const description = cleanText(req.body?.description, 2500);
    if (!title || !dateISO || !venue || !summary) {
      res.status(400).json({ error: 'Title, date, venue, and summary are required.' });
      return;
    }

    const db = readDatabase();
    const item: EventItem = {
      id: generateId('evt'),
      slug: slugify(title) || generateId('event'),
      title,
      category: normalizeEventCategory(category || 'Community Outreach'),
      dateISO,
      timeLabel: timeLabel || '10:00 – 13:00',
      venue,
      summary,
      description: description || summary,
      registrationOpen: req.body?.registrationOpen !== false,
      registrationNote:
        cleanText(req.body?.registrationNote, 300) ||
        'Open community event. Register below so our Care Family team can prepare warmly.',
      imageUrl:
        cleanText(req.body?.imageUrl, 500) ||
        '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
      imageAlt: cleanText(req.body?.imageAlt, 200) || title,
      featured: Boolean(req.body?.featured),
      createdAt: new Date().toISOString(),
    };
    db.events.unshift(item);
    writeDatabase(db);
    res.status(201).json({ event: item });
  });

  app.put('/api/admin/events/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const idx = db.events.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }
    const existing = db.events[idx];
    const title = cleanText(req.body?.title, 180) || existing.title;
    const rawCat = cleanText(req.body?.category, 60);
    const updated: EventItem = {
      ...existing,
      title,
      slug: slugify(title) || existing.slug,
      category: rawCat ? normalizeEventCategory(rawCat) : existing.category,
      dateISO: cleanText(req.body?.dateISO, 20) || existing.dateISO,
      timeLabel: cleanText(req.body?.timeLabel, 80) || existing.timeLabel,
      venue: cleanText(req.body?.venue, 200) || existing.venue,
      summary: cleanText(req.body?.summary, 400) || existing.summary,
      description: cleanText(req.body?.description, 2500) || existing.description,
      registrationOpen:
        typeof req.body?.registrationOpen === 'boolean'
          ? req.body.registrationOpen
          : existing.registrationOpen,
      registrationNote: cleanText(req.body?.registrationNote, 300) || existing.registrationNote,
      imageUrl: cleanText(req.body?.imageUrl, 500) || existing.imageUrl,
      imageAlt: cleanText(req.body?.imageAlt, 200) || existing.imageAlt,
      featured: typeof req.body?.featured === 'boolean' ? req.body.featured : existing.featured,
    };
    db.events[idx] = updated;
    writeDatabase(db);
    res.json({ event: updated });
  });

  app.delete('/api/admin/events/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const before = db.events.length;
    db.events = db.events.filter((e) => e.id !== req.params.id);
    if (db.events.length === before) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }
    writeDatabase(db);
    res.json({ deleted: true });
  });

  // Admin: Impact Stories CRUD
  app.post('/api/admin/impact', requireAdmin, (req, res) => {
    const title = cleanText(req.body?.title, 180);
    const summary = cleanText(req.body?.summary, 500);
    const whatWasDone = cleanText(req.body?.whatWasDone, 1500);
    if (!title || !summary || !whatWasDone) {
      res.status(400).json({ error: 'Title, summary, and initiative details are required.' });
      return;
    }
    const db = readDatabase();
    const project: ImpactProject = {
      id: generateId('imp'),
      slug: slugify(title) || generateId('impact'),
      title,
      category:
        (cleanText(req.body?.category, 80) as ImpactCategory) || 'Community Outreach',
      dateLabel: cleanText(req.body?.dateLabel, 60) || '2026',
      locationLabel: cleanText(req.body?.locationLabel, 140) || 'Community Outreach Site',
      summary,
      whatWasDone,
      whyItMattered: cleanText(req.body?.whyItMattered, 1500) || summary,
      whoItServed: cleanText(req.body?.whoItServed, 1000) || 'Local neighbours and families.',
      whatGlowHopedToAchieve:
        cleanText(req.body?.whatGlowHopedToAchieve, 1500) ||
        'Demonstrating compassionate care through practical community action.',
      documentedStory: cleanText(req.body?.documentedStory, 2500) || whatWasDone,
      imageUrl:
        cleanText(req.body?.imageUrl, 500) ||
        '/src/assets/images/impact_community_outreach_1794821887071.jpg',
      imageAlt: cleanText(req.body?.imageAlt, 200) || title,
      featured: Boolean(req.body?.featured),
      createdAt: new Date().toISOString(),
    };
    db.impactProjects.unshift(project);
    writeDatabase(db);
    res.status(201).json({ project });
  });

  app.delete('/api/admin/impact/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const before = db.impactProjects.length;
    db.impactProjects = db.impactProjects.filter((p) => p.id !== req.params.id);
    if (db.impactProjects.length === before) {
      res.status(404).json({ error: 'Impact initiative not found.' });
      return;
    }
    writeDatabase(db);
    res.json({ deleted: true });
  });

  // Admin: Announcements CRUD
  app.post('/api/admin/announcements', requireAdmin, (req, res) => {
    const title = cleanText(req.body?.title, 160);
    const message = cleanText(req.body?.message, 400);
    if (!title || !message) {
      res.status(400).json({ error: 'Announcement title and message are required.' });
      return;
    }
    const db = readDatabase();
    const announcement: Announcement = {
      id: generateId('ann'),
      title,
      message,
      linkLabel: cleanText(req.body?.linkLabel, 60) || undefined,
      linkPath: cleanText(req.body?.linkPath, 120) || undefined,
      isActive: req.body?.isActive !== false,
      publishedAt: new Date().toISOString(),
    };
    db.announcements.unshift(announcement);
    writeDatabase(db);
    res.status(201).json({ announcement });
  });

  app.patch('/api/admin/announcements/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const item = db.announcements.find((a) => a.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Announcement not found.' });
      return;
    }
    if (typeof req.body?.isActive === 'boolean') {
      item.isActive = req.body.isActive;
    }
    writeDatabase(db);
    res.json({ announcement: item });
  });

  app.delete('/api/admin/announcements/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
    writeDatabase(db);
    res.json({ deleted: true });
  });

  // Admin: Update submission statuses
  app.patch('/api/admin/submissions/:type/:id', requireAdmin, (req, res) => {
    const { type, id } = req.params;
    const status = cleanText(req.body?.status, 30);
    const db = readDatabase();

    if (type === 'prayer' && (status === 'new' || status === 'prayed' || status === 'archived')) {
      const target = db.prayerRequests.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Prayer request not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (
      type === 'counselling' &&
      (status === 'new' || status === 'assigned' || status === 'completed' || status === 'archived')
    ) {
      const target = db.counsellingRequests.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Counselling request not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (
      type === 'safehome' &&
      (status === 'new' || status === 'urgent-care' || status === 'sheltered' || status === 'archived')
    ) {
      const target = db.safeHomeRequests.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Safe home request not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (
      type === 'homevisit' &&
      (status === 'new' || status === 'scheduled' || status === 'completed' || status === 'archived')
    ) {
      const target = db.homeVisitBookings.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Children home visit booking not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (
      type === 'partner' &&
      (status === 'new' || status === 'onboarded' || status === 'archived')
    ) {
      const target = db.partnerOrganizations.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Partner organisation not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (
      type === 'rehab' &&
      (status === 'new' || status === 'matched' || status === 'in-care' || status === 'archived')
    ) {
      const target = db.rehabReferrals.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Rehabilitation referral not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (
      type === 'asd' &&
      (status === 'new' || status === 'answered' || status === 'connected' || status === 'archived')
    ) {
      const target = db.asdSupportRequests.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Mental health & trauma care request not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (
      type === 'specialneeds' &&
      (status === 'new' || status === 'connected' || status === 'supported' || status === 'archived')
    ) {
      const target = db.specialNeedsRequests.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Special needs family request not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (type === 'volunteer' && (status === 'new' || status === 'reviewed' || status === 'archived')) {
      const target = db.volunteerEnquiries.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Volunteer enquiry not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }
    if (type === 'contact' && (status === 'new' || status === 'reviewed' || status === 'archived')) {
      const target = db.contactMessages.find((r) => r.id === id);
      if (!target) return res.status(404).json({ error: 'Contact message not found.' });
      target.status = status;
      writeDatabase(db);
      return res.json({ updated: true });
    }

    res.status(400).json({ error: 'Invalid submission type or status.' });
  });

  // Admin: Administrators & Help Desk Particulars CRUD
  app.post('/api/admin/administrators', requireAdmin, (req, res) => {
    const fullName = cleanText(req.body?.fullName, 140) || 'Particulars Updating';
    const roleTitle = cleanText(req.body?.roleTitle, 160);
    const deskCode = cleanText(req.body?.deskCode, 40) || 'Desk';
    if (!roleTitle) {
      res.status(400).json({ error: 'Role title is required.' });
      return;
    }
    const db = readDatabase();
    const item: AdministratorDeskProfile = {
      id: generateId('adm'),
      deskCode,
      fullName,
      roleTitle,
      department: cleanText(req.body?.department, 140) || 'Community Care Coordination',
      status:
        req.body?.status === 'Active' ? 'Active' : 'Awaiting Staff Particulars',
      wardLocation: cleanText(req.body?.wardLocation, 140) || 'Ruiru, Kiambu County',
      officeHours: cleanText(req.body?.officeHours, 100) || 'Mon – Sat · 09:00 – 17:00',
      phone: cleanText(req.body?.phone, 60) || db.settings.contactPhone,
      whatsapp: cleanText(req.body?.whatsapp, 40) || db.settings.whatsappNumber,
      email: cleanText(req.body?.email, 140) || db.settings.contactEmail,
      photoUrl: cleanText(req.body?.photoUrl, 500) || '',
      focusSummary:
        cleanText(req.body?.focusSummary, 500) ||
        'Coordinating neighbourhood hospitality, families, and open community care.',
      routingHref: cleanText(req.body?.routingHref, 100) || '/contact',
      routingLabel: cleanText(req.body?.routingLabel, 80) || 'Reach This Desk',
      accentHex: cleanText(req.body?.accentHex, 20) || '#3B155F',
    };
    db.administrators.push(item);
    writeDatabase(db);
    res.status(201).json({ administrator: item });
  });

  app.put('/api/admin/administrators/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const idx = db.administrators.findIndex((a) => a.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Administrator entry not found.' });
      return;
    }
    const existing = db.administrators[idx];
    const updated: AdministratorDeskProfile = {
      ...existing,
      deskCode: cleanText(req.body?.deskCode, 40) || existing.deskCode,
      fullName: cleanText(req.body?.fullName, 140) || existing.fullName,
      roleTitle: cleanText(req.body?.roleTitle, 160) || existing.roleTitle,
      department: cleanText(req.body?.department, 140) || existing.department,
      status:
        req.body?.status === 'Active' || req.body?.status === 'Awaiting Staff Particulars'
          ? req.body.status
          : existing.status,
      wardLocation: cleanText(req.body?.wardLocation, 140) || existing.wardLocation,
      officeHours: cleanText(req.body?.officeHours, 100) || existing.officeHours,
      phone: cleanText(req.body?.phone, 60) || existing.phone,
      whatsapp: cleanText(req.body?.whatsapp, 40) ?? existing.whatsapp,
      email: cleanText(req.body?.email, 140) || existing.email,
      photoUrl:
        typeof req.body?.photoUrl === 'string'
          ? cleanText(req.body.photoUrl, 500)
          : existing.photoUrl,
      focusSummary: cleanText(req.body?.focusSummary, 500) || existing.focusSummary,
      routingHref: cleanText(req.body?.routingHref, 100) || existing.routingHref,
      routingLabel: cleanText(req.body?.routingLabel, 80) || existing.routingLabel,
      accentHex: cleanText(req.body?.accentHex, 20) || existing.accentHex,
    };
    db.administrators[idx] = updated;
    writeDatabase(db);
    res.json({ administrator: updated });
  });

  app.delete('/api/admin/administrators/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    const before = db.administrators.length;
    db.administrators = db.administrators.filter((a) => a.id !== req.params.id);
    if (db.administrators.length === before) {
      res.status(404).json({ error: 'Administrator entry not found.' });
      return;
    }
    writeDatabase(db);
    res.json({ deleted: true });
  });

  // Admin: Add / Remove Partner Children's Home
  app.post('/api/admin/childrens-homes', requireAdmin, (req, res) => {
    const name = cleanText(req.body?.name, 160);
    const countyRegion = cleanText(req.body?.countyRegion, 80);
    const townArea = cleanText(req.body?.townArea, 100);
    const description = cleanText(req.body?.description, 600);
    if (!name || !countyRegion || !description) {
      res.status(400).json({ error: 'Home name, county, and description are required.' });
      return;
    }
    const db = readDatabase();
    const countyInfo = findKenyaCounty(countyRegion);
    const home: ChildrensHome = {
      id: generateId('ch'),
      name,
      institutionType:
        req.body?.institutionType === 'School for Differently Abled'
          ? 'School for Differently Abled'
          : 'Children’s Home',
      regionGroup: cleanText(req.body?.regionGroup, 60) || countyInfo.region,
      specialization: cleanText(req.body?.specialization, 140) || undefined,
      countyRegion,
      townArea: townArea || countyRegion,
      physicalAddress:
        cleanText(req.body?.physicalAddress, 220) || `${townArea || countyRegion}, ${countyInfo.physicalAddress}`,
      contactPhone: cleanText(req.body?.contactPhone, 60) || countyInfo.facilityPhone,
      contactEmail: cleanText(req.body?.contactEmail, 140) || countyInfo.facilityEmail,
      websiteUrl: cleanText(req.body?.websiteUrl, 250) || countyInfo.websiteUrl,
      visitingHours: cleanText(req.body?.visitingHours, 120) || 'Mon – Sat · 09:00 – 16:00',
      childrenAgeRange: cleanText(req.body?.childrenAgeRange, 80) || 'Ages 4 – 17',
      currentNeeds: String(req.body?.currentNeeds || 'School Supplies, Groceries')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5),
      acceptsCorporateTeams: req.body?.acceptsCorporateTeams !== false,
      acceptsIndividualGroups: req.body?.acceptsIndividualGroups !== false,
      description,
      imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
      imageAlt: `${name} partner children home courtyard`,
    };
    db.childrensHomes.unshift(home);
    writeDatabase(db);
    res.status(201).json({ home });
  });

  app.delete('/api/admin/childrens-homes/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    db.childrensHomes = db.childrensHomes.filter((h) => h.id !== req.params.id);
    writeDatabase(db);
    res.json({ deleted: true });
  });

  // Admin: Add / Remove Rehabilitation Facility
  app.post('/api/admin/rehab-facilities', requireAdmin, (req, res) => {
    const name = cleanText(req.body?.name, 160);
    const countyRegion = cleanText(req.body?.countyRegion, 80);
    const townArea = cleanText(req.body?.townArea, 100);
    const summary = cleanText(req.body?.summary, 600);
    if (!name || !countyRegion || !summary) {
      res.status(400).json({ error: 'Facility name, county, and summary are required.' });
      return;
    }
    const db = readDatabase();
    const countyInfo = findKenyaCounty(countyRegion);
    const facility: RehabFacility = {
      id: generateId('reh'),
      name,
      focusType: (cleanText(req.body?.focusType, 80) as RehabFacility['focusType']) || 'Family & Holistic Care',
      careFormat: (cleanText(req.body?.careFormat, 80) as RehabFacility['careFormat']) || 'Residential & Outpatient',
      countyRegion,
      townArea: townArea || countyRegion,
      physicalAddress:
        cleanText(req.body?.physicalAddress, 220) || `${townArea || countyRegion}, ${countyInfo.physicalAddress}`,
      contactPhone: cleanText(req.body?.contactPhone, 60) || countyInfo.facilityPhone,
      contactEmail: cleanText(req.body?.contactEmail, 140) || countyInfo.facilityEmail,
      websiteUrl: cleanText(req.body?.websiteUrl, 250) || countyInfo.websiteUrl,
      visitingHours: cleanText(req.body?.visitingHours, 120) || 'Mon – Sat · 08:30 – 17:00',
      lat: Number.isFinite(Number(req.body?.lat)) ? Number(req.body.lat) : countyInfo.lat,
      lng: Number.isFinite(Number(req.body?.lng)) ? Number(req.body.lng) : countyInfo.lng,
      acceptsCommunityReferrals: true,
      summary,
      imageUrl: '/src/assets/images/doc_rehab_recovery_garden_1794832339842.jpg',
      imageAlt: `${name} rehabilitation courtyard`,
    };
    db.rehabFacilities.unshift(facility);
    writeDatabase(db);
    res.status(201).json({ facility });
  });

  app.delete('/api/admin/rehab-facilities/:id', requireAdmin, (req, res) => {
    const db = readDatabase();
    db.rehabFacilities = db.rehabFacilities.filter((f) => f.id !== req.params.id);
    writeDatabase(db);
    res.json({ deleted: true });
  });

  return app;
}
