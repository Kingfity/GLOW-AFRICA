import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  sanitizeAssistantResult,
  validateAssistantMessage,
  validateVillageContribution,
} from './src/utils/careTools.ts';
import {
  findKenyaCounty,
  validateEmergencyAuthorityAlert,
} from './src/utils/kenyaCounties.ts';
import {
  clearSessionCookie,
  getSessionFromRequest,
  requireAdmin,
  setSessionCookie,
  verifyCredentials,
  type AuthenticatedRequest,
} from './server/auth.ts';
import {
  generateId,
  getPublicSiteData,
  readDatabase,
  writeDatabase,
} from './server/store.ts';
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
  validateVolunteerEnquiry,
} from './src/utils/validation.ts';
import type {
  Announcement,
  ChildrensHome,
  EventCategory,
  EventItem,
  ImpactCategory,
  ImpactProject,
  RehabFacility,
  SiteSettings,
} from './src/shared/types.ts';

const PORT = 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const VIDEOS_DIR = path.resolve(process.cwd(), 'public', 'videos');

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    })
  : null;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateBuckets.get(ip);
  if (!entry || entry.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count += 1;
  return true;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '6mb' }));

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use('/uploads', express.static(UPLOADS_DIR));
  if (fs.existsSync(VIDEOS_DIR)) {
    app.use('/videos', express.static(VIDEOS_DIR));
  }

  // Public site data (never exposes private prayer, counselling, safe-home, volunteer, or contact submissions)
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
    const asdSummary = publicData.asdGuides
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
      'You are the warm, compassionate HIS AND HERS Care Family Guide.',
      'Your role is to listen briefly to what a visitor, parent, corporate team, or loved one needs and guide them directly to the right verified HIS AND HERS page or resource.',
      'Available routes (ONLY recommend href values from this exact list):',
      '- /home-visits: Book individuals, friend groups, or corporate CSR teams to visit Children’s Homes, OR onboard a Corporate/NGO/Children’s Home partner.',
      '- /rehabilitation: Search verified rehabilitation facilities sorted by proximity and submit a confidential referral.',
      '- /asd-support: ASD Parents & Kids Support Hub with interactive Visual Daily Routine Builder, calming sensory tips, and ASD parent mentors.',
      '- /counselling: Talk to a Counsellor, Lighten Your Burden (anonymous or callback), and 60-second grounding breath tool.',
      '- /find-my-home: Urgent safe refuge coordination for individuals/children fleeing gender-based violence or child abuse (with Quick Exit safety).',
      '- /prayer-worship: Confidential prayer request & interdenominational fellowship details.',
      '- /events: Upcoming Children’s Home visit days, ASD play mornings, and gatherings.',
      '- /get-involved: Volunteer and stewardship pathways.',
      '- /contact: Direct contact channels.',
      `Current Children’s Homes: ${homesSummary}`,
      `Current Rehabilitation Centres: ${rehabSummary}`,
      `Current ASD Guides: ${asdSummary}`,
      'Guidelines: Be concise (2–4 gentle sentences), never invent fake phone numbers or addresses, never claim medical diagnoses, and if abuse or acute crisis is mentioned include urgentSafetyNote guiding them to /find-my-home or emergency services.',
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

  // Public submission: Book a Children's Home Visit (Individuals, Groups & Corporates)
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

  // Public submission: Corporate / NGO / Children's Home Partner Onboarding
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
      message: `Thank you. ${validation.data.organizationName} has been submitted to our Partner Network desk for collaboration onboarding.`,
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

  // Public submission: ASD Parents & Kids Support Request
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
      id: generateId('asd'),
      ...validation.data,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    writeDatabase(db);
    res.status(201).json({
      received: true,
      message:
        'Thank you for connecting with our ASD Family Hub. A parent mentor and care coordinator will follow up with tailored tips and community support.',
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
      message: 'Thank you for reaching out to HIS AND HERS. We will respond as soon as possible.',
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
    const email = cleanText(req.body?.email, 160);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const user = verifyCredentials(email, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid administrator email or password.' });
      return;
    }
    setSessionCookie(res, user);
    res.json({ authenticated: true, user });
  });

  app.post('/api/admin/logout', (_req, res) => {
    clearSessionCookie(res);
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
      volunteerEnquiries: db.volunteerEnquiries,
      contactMessages: db.contactMessages,
      eventRegistrations: db.eventRegistrations,
      emergencyAlerts: db.emergencyAlerts,
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

  // Admin: Upload Photograph
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const dataUrl = typeof req.body?.dataUrl === 'string' ? req.body.dataUrl : '';
    const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Please upload a valid PNG, JPG, or WEBP image.' });
      return;
    }
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      res.status(400).json({ error: 'Uploaded image must be smaller than 4 MB.' });
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

  // Admin: Update status of submissions across all support & outreach queues
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
      if (!target) return res.status(404).json({ error: 'ASD support request not found.' });
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
    const home: ChildrensHome = {
      id: generateId('ch'),
      name,
      countyRegion,
      townArea: townArea || countyRegion,
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
    const facility: RehabFacility = {
      id: generateId('reh'),
      name,
      focusType: (cleanText(req.body?.focusType, 80) as RehabFacility['focusType']) || 'Family & Holistic Care',
      careFormat: (cleanText(req.body?.careFormat, 80) as RehabFacility['careFormat']) || 'Residential & Outpatient',
      countyRegion,
      townArea: townArea || countyRegion,
      lat: Number.isFinite(Number(req.body?.lat)) ? Number(req.body.lat) : -1.2921,
      lng: Number.isFinite(Number(req.body?.lng)) ? Number(req.body.lng) : 36.8219,
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

  const isPrivacyHardenedPath = (reqPath: string) =>
    reqPath === '/gbv' ||
    reqPath.startsWith('/gbv/') ||
    reqPath === '/recovery' ||
    reqPath.startsWith('/recovery/');

  const applyPrivacyHeaders = (res: express.Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
  };

  const hardenIsolatedHtml = (html: string): string => {
    // Strip any third-party external preconnects, external font stylesheets, or external analytics tags
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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.get('*', async (req, res, next) => {
      if (!isPrivacyHardenedPath(req.path)) {
        return next();
      }
      try {
        applyPrivacyHeaders(res);
        const rawHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        res.status(200).type('html').send(hardenIsolatedHtml(transformed));
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
      if (isPrivacyHardenedPath(req.path)) {
        applyPrivacyHeaders(res);
        res.status(200).type('html').send(hardenIsolatedHtml(indexHtml));
        return;
      }
      res.status(200).type('html').send(indexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HIS AND HERS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
