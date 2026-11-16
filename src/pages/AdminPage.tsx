import React, { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  Heart,
  ImagePlus,
  LogOut,
  Mail,
  Megaphone,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import type {
  AdminDashboardData,
  AdminUserSession,
  Announcement,
  EventCategory,
  EventItem,
  ImpactCategory,
  ImpactProject,
  SiteSettings,
} from '../shared/types';
import { formatEventDate } from '../utils/validation';

type AdminTab =
  | 'prayer'
  | 'events'
  | 'impact'
  | 'volunteers'
  | 'messages'
  | 'announcements'
  | 'settings';

export function AdminPage() {
  const { refresh: refreshPublicSite } = useSiteData();
  const [session, setSession] = useState<AdminUserSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('prayer');
  const [dashboard, setDashboard] = useState<
    (AdminDashboardData & {
      settings: SiteSettings;
      announcements: Announcement[];
      impactProjects: ImpactProject[];
      events: EventItem[];
    }) | null
  >(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Event creation / editing form state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<EventCategory>('Worship Gathering');
  const [evtDate, setEvtDate] = useState('2026-12-15');
  const [evtTime, setEvtTime] = useState('17:00 – 19:00');
  const [evtVenue, setEvtVenue] = useState('');
  const [evtSummary, setEvtSummary] = useState('');
  const [evtDescription, setEvtDescription] = useState('');
  const [evtImageUrl, setEvtImageUrl] = useState(
    '/src/assets/images/worship_gathering_sanctuary_1794821887938.jpg'
  );

  // Impact story creation state
  const [impTitle, setImpTitle] = useState('');
  const [impCategory, setImpCategory] = useState<ImpactCategory>('Community Outreach');
  const [impDateLabel, setImpDateLabel] = useState('November 2026');
  const [impLocation, setImpLocation] = useState('');
  const [impSummary, setImpSummary] = useState('');
  const [impWhatWasDone, setImpWhatWasDone] = useState('');
  const [impWhyMattered, setImpWhyMattered] = useState('');
  const [impWhoServed, setImpWhoServed] = useState('');
  const [impAchieve, setImpAchieve] = useState('');
  const [impImageUrl, setImpImageUrl] = useState(
    '/src/assets/images/impact_community_outreach_1794821887071.jpg'
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Announcement creation state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);

  const loadDashboard = useCallback(async () => {
    const res = await fetch('/api/admin/dashboard');
    if (res.ok) {
      const payload = await res.json();
      setDashboard(payload);
      setSettingsForm(payload.settings);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/session');
        const payload = await res.json();
        if (payload.authenticated && payload.user) {
          setSession(payload.user);
          await loadDashboard();
        }
      } finally {
        setCheckingSession(false);
      }
    })();
  }, [loadDashboard]);

  const notify = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setLoginError(payload.error || 'Authentication failed.');
        return;
      }
      setSession(payload.user);
      await loadDashboard();
    } catch {
      setLoginError('Network error while signing in.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setSession(null);
    setDashboard(null);
  };

  const handlePhotoUpload = async (
    file: File | undefined,
    onUrl: (url: string) => void
  ) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      });
      const payload = await res.json();
      if (res.ok && payload.url) {
        onUrl(payload.url);
        notify('Photograph uploaded successfully.');
      } else {
        notify(payload.error || 'Could not upload photograph.');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const startEditEvent = (evt: EventItem) => {
    setEditingEventId(evt.id);
    setEvtTitle(evt.title);
    setEvtCategory(evt.category);
    setEvtDate(evt.dateISO);
    setEvtTime(evt.timeLabel);
    setEvtVenue(evt.venue);
    setEvtSummary(evt.summary);
    setEvtDescription(evt.description);
    setEvtImageUrl(evt.imageUrl);
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEvtTitle('');
    setEvtCategory('Worship Gathering');
    setEvtDate('2026-12-15');
    setEvtTime('17:00 – 19:00');
    setEvtVenue('');
    setEvtSummary('');
    setEvtDescription('');
    setEvtImageUrl('/src/assets/images/worship_gathering_sanctuary_1794821887938.jpg');
  };

  const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingEventId
      ? `/api/admin/events/${editingEventId}`
      : '/api/admin/events';
    const method = editingEventId ? 'PUT' : 'POST';
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: evtTitle,
        category: evtCategory,
        dateISO: evtDate,
        timeLabel: evtTime,
        venue: evtVenue,
        summary: evtSummary,
        description: evtDescription || evtSummary,
        imageUrl: evtImageUrl,
        featured: true,
      }),
    });
    if (res.ok) {
      const wasEditing = Boolean(editingEventId);
      resetEventForm();
      await loadDashboard();
      await refreshPublicSite();
      notify(wasEditing ? 'Gathering details updated.' : 'Gathering added and published.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadDashboard();
      await refreshPublicSite();
      notify('Gathering removed.');
    }
  };

  const handleCreateImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: impTitle,
        category: impCategory,
        dateLabel: impDateLabel,
        locationLabel: impLocation,
        summary: impSummary,
        whatWasDone: impWhatWasDone,
        whyItMattered: impWhyMattered,
        whoItServed: impWhoServed,
        whatGlowHopedToAchieve: impAchieve,
        imageUrl: impImageUrl,
        featured: true,
      }),
    });
    if (res.ok) {
      setImpTitle('');
      setImpLocation('');
      setImpSummary('');
      setImpWhatWasDone('');
      setImpWhyMattered('');
      setImpWhoServed('');
      setImpAchieve('');
      await loadDashboard();
      await refreshPublicSite();
      notify('Impact initiative story published.');
    }
  };

  const handleDeleteImpact = async (id: string) => {
    const res = await fetch(`/api/admin/impact/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadDashboard();
      await refreshPublicSite();
      notify('Impact story removed.');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: annTitle,
        message: annMessage,
        linkLabel: 'View Gatherings',
        linkPath: '/events',
        isActive: true,
      }),
    });
    if (res.ok) {
      setAnnTitle('');
      setAnnMessage('');
      await loadDashboard();
      await refreshPublicSite();
      notify('Announcement published.');
    }
  };

  const handleToggleAnnouncement = async (ann: Announcement) => {
    const res = await fetch(`/api/admin/announcements/${ann.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ann.isActive }),
    });
    if (res.ok) {
      await loadDashboard();
      await refreshPublicSite();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadDashboard();
      await refreshPublicSite();
    }
  };

  const handleSubmissionStatus = async (
    type: 'prayer' | 'volunteer' | 'contact',
    id: string,
    status: string
  ) => {
    const res = await fetch(`/api/admin/submissions/${type}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadDashboard();
      notify('Record status updated.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsForm),
    });
    if (res.ok) {
      await loadDashboard();
      await refreshPublicSite();
      notify('Site content and contact details saved.');
    }
  };

  if (checkingSession) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center text-sm text-[#665B73]">
        Verifying administrative session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-md mx-auto px-5">
          <div className="bg-white border border-[#3B155F]/15 rounded-lg p-8 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Stewardship CMS
              </div>
              <h1 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                Authorised Admin Sign In
              </h1>
              <p className="text-sm text-[#665B73]">
                Review private prayer requests, manage gatherings, publish impact stories, and
                update public contact details.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-[#1E0B2B] mb-1"
                >
                  Administrator Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@glowchurchafrica.org"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-[#1E0B2B] mb-1"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              {loginError && (
                <p role="alert" className="text-xs text-red-700 bg-red-50 p-3 rounded-md">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full px-5 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] disabled:opacity-60 rounded-md transition-colors"
              >
                {loggingIn ? 'Signing In...' : 'Sign In to CMS'}
              </button>
            </form>

            <div className="pt-4 border-t border-[#3B155F]/10 text-xs text-[#665B73] space-y-1">
              <p className="font-semibold text-[#1E0B2B]">Default Local Environment Credentials</p>
              <p>
                Email: <span className="font-mono">admin@glowchurchafrica.org</span>
              </p>
              <p>
                Password: <span className="font-mono">GlowAdmin!2026</span>
              </p>
              <p className="pt-1">
                Configure <span className="font-mono">GLOW_ADMIN_EMAIL</span> and{' '}
                <span className="font-mono">GLOW_ADMIN_PASSWORD</span> in your environment before
                production deployment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; count?: number; icon: React.ReactNode }> = [
    {
      id: 'prayer',
      label: 'Prayer Requests',
      count: dashboard?.prayerRequests.length || 0,
      icon: <Heart className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'events',
      label: 'Events',
      count: dashboard?.events.length || 0,
      icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'impact',
      label: 'Impact Stories',
      count: dashboard?.impactProjects.length || 0,
      icon: <ImagePlus className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'volunteers',
      label: 'Volunteers',
      count: dashboard?.volunteerEnquiries.length || 0,
      icon: <Users className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'messages',
      label: 'Messages',
      count: dashboard?.contactMessages.length || 0,
      icon: <Mail className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'announcements',
      label: 'Announcements',
      count: dashboard?.announcements.length || 0,
      icon: <Megaphone className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'settings',
      label: 'Site & Contact',
      icon: <Settings className="w-4 h-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-[75vh] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-8">
        {/* Top Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3B155F]/12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5A10]">
              GLOW Church Africa · Stewardship Console
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
              Content &amp; Pastoral Administration
            </h1>
            <p className="text-xs text-[#665B73] mt-1">
              Signed in as {session.name} ({session.email})
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#3B155F] bg-white border border-[#3B155F]/20 rounded-md hover:bg-[#F3EEF8] whitespace-nowrap self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>

        {statusNotice && (
          <div
            role="status"
            className="p-3.5 rounded-md bg-white border border-[#3B155F]/25 text-sm text-[#1E0B2B] flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-[#3B155F]" aria-hidden="true" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Administrative sections"
          className="flex flex-wrap gap-2"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#3B155F] text-[#FAF7F2]'
                    : 'bg-white text-[#3E3349] border border-[#3B155F]/15 hover:bg-[#F3EEF8]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="tabular-nums opacity-80">({tab.count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Private Prayer Requests */}
        {activeTab === 'prayer' && (
          <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Confidential Prayer Requests
              </h2>
              <p className="text-sm text-[#665B73]">
                Visible strictly to authorised stewards. Never exposed publicly.
              </p>
            </div>
            {!dashboard?.prayerRequests.length ? (
              <p className="text-sm text-[#665B73] py-8 text-center border border-dashed border-[#3B155F]/15 rounded-md">
                No prayer requests have been submitted yet.
              </p>
            ) : (
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard.prayerRequests.map((req) => (
                  <div key={req.id} className="py-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B73]">
                      <div>
                        <span className="font-semibold text-[#1E0B2B]">{req.name}</span>
                        {req.contact && <span> · {req.contact}</span>}
                        <span> · {new Date(req.createdAt).toLocaleString()}</span>
                      </div>
                      <span className="font-semibold uppercase text-[#7A5A10]">
                        Status: {req.status}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#1A1224] leading-relaxed">
                      {req.requestText}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('prayer', req.id, 'prayed')}
                        className="px-3 py-1.5 text-xs font-medium bg-[#F3EEF8] text-[#3B155F] rounded hover:bg-[#E7DFF1]"
                      >
                        Mark as Prayed For
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('prayer', req.id, 'archived')}
                        className="px-3 py-1.5 text-xs font-medium border border-[#3B155F]/15 text-[#665B73] rounded hover:bg-[#FAF7F2]"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Events CRUD */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateOrUpdateEvent}
              className="lg:col-span-5 bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                  {editingEventId ? 'Edit Gathering' : 'Add New Gathering'}
                </h2>
                {editingEventId && (
                  <button
                    type="button"
                    onClick={resetEventForm}
                    className="text-xs font-medium text-[#665B73] hover:text-[#1E0B2B] underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <div>
                <label htmlFor="cms-evt-title" className="block text-xs font-medium mb-1">
                  Title *
                </label>
                <input
                  id="cms-evt-title"
                  required
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cms-evt-cat" className="block text-xs font-medium mb-1">
                    Category
                  </label>
                  <select
                    id="cms-evt-cat"
                    value={evtCategory}
                    onChange={(e) => setEvtCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  >
                    <option>Worship Gathering</option>
                    <option>Prayer Meeting</option>
                    <option>Special Service</option>
                    <option>Community Outreach</option>
                    <option>Conference</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cms-evt-date" className="block text-xs font-medium mb-1">
                    Date *
                  </label>
                  <input
                    id="cms-evt-date"
                    type="date"
                    required
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md tabular-nums"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cms-evt-time" className="block text-xs font-medium mb-1">
                    Time
                  </label>
                  <input
                    id="cms-evt-time"
                    value={evtTime}
                    onChange={(e) => setEvtTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="cms-evt-venue" className="block text-xs font-medium mb-1">
                    Venue *
                  </label>
                  <input
                    id="cms-evt-venue"
                    required
                    value={evtVenue}
                    onChange={(e) => setEvtVenue(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cms-evt-summary" className="block text-xs font-medium mb-1">
                  Summary *
                </label>
                <textarea
                  id="cms-evt-summary"
                  rows={2}
                  required
                  value={evtSummary}
                  onChange={(e) => setEvtSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cms-evt-desc" className="block text-xs font-medium mb-1">
                  Full Description
                </label>
                <textarea
                  id="cms-evt-desc"
                  rows={3}
                  value={evtDescription}
                  onChange={(e) => setEvtDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cms-evt-upload" className="block text-xs font-medium mb-1">
                  Upload Gathering Photo (Optional)
                </label>
                <input
                  id="cms-evt-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0], setEvtImageUrl)}
                  className="text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={uploadingPhoto}
                className="w-full px-4 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md"
              >
                {editingEventId ? 'Save Gathering Changes' : 'Publish Gathering'}
              </button>
            </form>

            <div className="lg:col-span-7 bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Published Gatherings &amp; RSVPs ({dashboard?.eventRegistrations.length || 0} RSVPs)
              </h2>
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard?.events.map((evt) => (
                  <div key={evt.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#7A5A10] font-semibold">
                        {evt.category} · <span className="tabular-nums">{formatEventDate(evt.dateISO)}</span>
                      </p>
                      <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">{evt.title}</h3>
                      <p className="text-xs text-[#665B73]">{evt.venue}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditEvent(evt)}
                        className="px-3 py-1.5 text-xs font-medium text-[#3B155F] border border-[#3B155F]/20 rounded hover:bg-[#F3EEF8]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        aria-label={`Delete gathering ${evt.title}`}
                        className="p-2 text-red-700 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Impact Stories CRUD */}
        {activeTab === 'impact' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateImpact}
              className="lg:col-span-5 bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-4"
            >
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Publish Impact Story
              </h2>
              <div>
                <label htmlFor="cms-imp-title" className="block text-xs font-medium mb-1">
                  Initiative Title *
                </label>
                <input
                  id="cms-imp-title"
                  required
                  value={impTitle}
                  onChange={(e) => setImpTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cms-imp-cat" className="block text-xs font-medium mb-1">
                    Category
                  </label>
                  <select
                    id="cms-imp-cat"
                    value={impCategory}
                    onChange={(e) => setImpCategory(e.target.value as ImpactCategory)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  >
                    <option>Community Outreach</option>
                    <option>Acts of Compassion</option>
                    <option>Support for Vulnerable Communities</option>
                    <option>Community Engagement</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cms-imp-date" className="block text-xs font-medium mb-1">
                    Date Label
                  </label>
                  <input
                    id="cms-imp-date"
                    value={impDateLabel}
                    onChange={(e) => setImpDateLabel(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cms-imp-loc" className="block text-xs font-medium mb-1">
                  Location
                </label>
                <input
                  id="cms-imp-loc"
                  value={impLocation}
                  onChange={(e) => setImpLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cms-imp-summary" className="block text-xs font-medium mb-1">
                  Summary *
                </label>
                <textarea
                  id="cms-imp-summary"
                  rows={2}
                  required
                  value={impSummary}
                  onChange={(e) => setImpSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cms-imp-what" className="block text-xs font-medium mb-1">
                  What Was Done *
                </label>
                <textarea
                  id="cms-imp-what"
                  rows={2}
                  required
                  value={impWhatWasDone}
                  onChange={(e) => setImpWhatWasDone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cms-imp-why" className="block text-xs font-medium mb-1">
                  Why It Mattered
                </label>
                <textarea
                  id="cms-imp-why"
                  rows={2}
                  value={impWhyMattered}
                  onChange={(e) => setImpWhyMattered(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cms-imp-who" className="block text-xs font-medium mb-1">
                  Who It Served
                </label>
                <input
                  id="cms-imp-who"
                  value={impWhoServed}
                  onChange={(e) => setImpWhoServed(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cms-imp-upload" className="block text-xs font-medium mb-1">
                  Upload Initiative Photograph
                </label>
                <input
                  id="cms-imp-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0], setImpImageUrl)}
                  className="text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={uploadingPhoto}
                className="w-full px-4 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md"
              >
                Publish Impact Story
              </button>
            </form>

            <div className="lg:col-span-7 bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Documented Impact Initiatives
              </h2>
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard?.impactProjects.map((proj) => (
                  <div key={proj.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#7A5A10] font-semibold">
                        {proj.category} · {proj.dateLabel}
                      </p>
                      <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-[#665B73]">{proj.locationLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImpact(proj.id)}
                      aria-label={`Delete impact story ${proj.title}`}
                      className="p-2 text-red-700 hover:bg-red-50 rounded-md shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Volunteer Enquiries */}
        {activeTab === 'volunteers' && (
          <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              Volunteer &amp; Partnership Enquiries
            </h2>
            {!dashboard?.volunteerEnquiries.length ? (
              <p className="text-sm text-[#665B73] py-8 text-center">
                No volunteer enquiries submitted yet.
              </p>
            ) : (
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard.volunteerEnquiries.map((vol) => (
                  <div key={vol.id} className="py-4 space-y-2">
                    <div className="flex flex-wrap justify-between gap-2 text-xs text-[#665B73]">
                      <span>
                        <strong className="text-[#1E0B2B]">{vol.fullName}</strong> · {vol.email}
                        {vol.phone && ` · ${vol.phone}`}
                      </span>
                      <span className="font-semibold text-[#7A5A10]">
                        {vol.areaOfInterest} · {vol.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#3E3349]">{vol.message}</p>
                    <button
                      type="button"
                      onClick={() => handleSubmissionStatus('volunteer', vol.id, 'reviewed')}
                      className="px-3 py-1 text-xs font-medium bg-[#F3EEF8] text-[#3B155F] rounded"
                    >
                      Mark Reviewed
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 5: Contact Messages & Event Registrations */}
        {activeTab === 'messages' && (
          <div className="space-y-8">
            <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Contact Messages
              </h2>
              {!dashboard?.contactMessages.length ? (
                <p className="text-sm text-[#665B73]">No contact messages yet.</p>
              ) : (
                <div className="divide-y divide-[#3B155F]/10">
                  {dashboard.contactMessages.map((msg) => (
                    <div key={msg.id} className="py-4 space-y-1.5">
                      <p className="text-xs text-[#665B73]">
                        <strong className="text-[#1E0B2B]">{msg.fullName}</strong> ({msg.email}) ·{' '}
                        {msg.subject} · {msg.status}
                      </p>
                      <p className="text-sm text-[#3E3349]">{msg.message}</p>
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('contact', msg.id, 'reviewed')}
                        className="px-3 py-1 text-xs font-medium bg-[#F3EEF8] text-[#3B155F] rounded"
                      >
                        Mark Reviewed
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Event Registrations
              </h2>
              {!dashboard?.eventRegistrations.length ? (
                <p className="text-sm text-[#665B73]">No event registrations yet.</p>
              ) : (
                <div className="divide-y divide-[#3B155F]/10">
                  {dashboard.eventRegistrations.map((reg) => (
                    <div key={reg.id} className="py-3 text-sm text-[#3E3349]">
                      <strong className="text-[#1E0B2B]">{reg.fullName}</strong> ({reg.email}) —{' '}
                      {reg.eventTitle} ·{' '}
                      <span className="tabular-nums">{reg.attendeesCount} attendee(s)</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab 6: Announcements */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateAnnouncement}
              className="lg:col-span-5 bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-4"
            >
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Publish Announcement
              </h2>
              <div>
                <label htmlFor="cms-ann-title" className="block text-xs font-medium mb-1">
                  Announcement Title *
                </label>
                <input
                  id="cms-ann-title"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="cms-ann-msg" className="block text-xs font-medium mb-1">
                  Message *
                </label>
                <textarea
                  id="cms-ann-msg"
                  rows={3}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] rounded-md"
              >
                Publish Notice
              </button>
            </form>

            <div className="lg:col-span-7 bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Current Announcements
              </h2>
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard?.announcements.map((ann) => (
                  <div key={ann.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#7A5A10]">
                        {ann.isActive ? 'Active on Homepage' : 'Hidden'}
                      </p>
                      <h3 className="font-semibold text-[#1E0B2B]">{ann.title}</h3>
                      <p className="text-sm text-[#3E3349]">{ann.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleAnnouncement(ann)}
                        className="px-3 py-1.5 text-xs font-medium border border-[#3B155F]/20 rounded"
                      >
                        {ann.isActive ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        aria-label={`Delete announcement ${ann.title}`}
                        className="p-1.5 text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Site Content & Contact Settings */}
        {activeTab === 'settings' && settingsForm && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6"
          >
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              Update Website Content &amp; Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="set-hero" className="block text-xs font-medium mb-1">
                  Hero Headline
                </label>
                <input
                  id="set-hero"
                  value={settingsForm.heroHeadline}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="set-loc" className="block text-xs font-medium mb-1">
                  Primary Location Label
                </label>
                <input
                  id="set-loc"
                  value={settingsForm.primaryLocationLabel}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, primaryLocationLabel: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="set-email" className="block text-xs font-medium mb-1">
                  Official Contact Email
                </label>
                <input
                  id="set-email"
                  value={settingsForm.contactEmail}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, contactEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="set-phone" className="block text-xs font-medium mb-1">
                  Contact Telephone
                </label>
                <input
                  id="set-phone"
                  value={settingsForm.contactPhone}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, contactPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
            </div>
            <div>
              <label htmlFor="set-address" className="block text-xs font-medium mb-1">
                Venue Address &amp; Directions
              </label>
              <input
                id="set-address"
                value={settingsForm.primaryAddress}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, primaryAddress: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="set-hero-sub" className="block text-xs font-medium mb-1">
                Hero Supporting Message
              </label>
              <textarea
                id="set-hero-sub"
                rows={3}
                value={settingsForm.heroSubheadline}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, heroSubheadline: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md"
            >
              Save Public Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
