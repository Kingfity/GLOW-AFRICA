import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createServer as createViteServer } from 'vite';
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
  slugify,
  validateContactMessage,
  validateEventRegistration,
  validatePrayerRequest,
  validateVolunteerEnquiry,
} from './src/utils/validation.ts';
import type {
  Announcement,
  EventCategory,
  EventItem,
  ImpactCategory,
  ImpactProject,
  SiteSettings,
} from './src/shared/types.ts';

const PORT = 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Simple in-memory rate limiter per IP for public submission forms
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

  // Public site data (never includes private prayer requests, volunteer enquiries, or contact messages)
  app.get('/api/public-data', (_req, res) => {
    res.json(getPublicSiteData());
  });

  // Public submission: Prayer Request (strictly private, never returned in public endpoints)
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
      message: 'Your prayer request has been received privately by our prayer team.',
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
      message: 'Thank you for reaching out to GLOW Church Africa. We will respond as soon as possible.',
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
      prayerRequests: db.prayerRequests,
      volunteerEnquiries: db.volunteerEnquiries,
      contactMessages: db.contactMessages,
      eventRegistrations: db.eventRegistrations,
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

  // Admin: Upload Photograph (base64 data URL -> /uploads/<file>)
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
    const filename = `glow-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
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
      category: category || 'Worship Gathering',
      dateISO,
      timeLabel: timeLabel || '17:00 – 19:00',
      venue,
      summary,
      description: description || summary,
      registrationOpen: req.body?.registrationOpen !== false,
      registrationNote:
        cleanText(req.body?.registrationNote, 300) ||
        'Open gathering. Register below so we can welcome you warmly.',
      imageUrl:
        cleanText(req.body?.imageUrl, 500) ||
        '/src/assets/images/worship_gathering_sanctuary_1794821887938.jpg',
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
    const updated: EventItem = {
      ...existing,
      title,
      slug: slugify(title) || existing.slug,
      category: (cleanText(req.body?.category, 60) as EventCategory) || existing.category,
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
        'Demonstrating God’s love through compassionate, practical care.',
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

  // Admin: Update status of prayer requests / volunteers / contact messages
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

  // Vite middleware in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GLOW Church Africa server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
