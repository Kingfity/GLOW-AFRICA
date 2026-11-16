import React, { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  Calendar,
  CalendarCheck2,
  Check,
  Heart,
  ImagePlus,
  LocateFixed,
  LogOut,
  Mail,
  Megaphone,
  MessageSquareHeart,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import {
  HELPING_HAND_EVENT_CATEGORIES,
  type AdminDashboardData,
  type AdminUserSession,
  type Announcement,
  type EventCategory,
  type EventItem,
  type ImpactCategory,
  type ImpactProject,
  type SiteSettings,
} from '../shared/types';
import { formatEventDate, normalizeEventCategory } from '../utils/validation';

type AdminTab =
  | 'homevisits'
  | 'partners'
  | 'rehab'
  | 'asd'
  | 'counselling'
  | 'safehome'
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

  const [activeTab, setActiveTab] = useState<AdminTab>('counselling');
  const [dashboard, setDashboard] = useState<
    (AdminDashboardData & {
      settings: SiteSettings;
      announcements: Announcement[];
      impactProjects: ImpactProject[];
      events: EventItem[];
    }) | null
  >(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Event creation / editing form state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<EventCategory>('Children’s Home Visits');
  const [evtDate, setEvtDate] = useState('2026-12-22');
  const [evtTime, setEvtTime] = useState('09:30 – 14:30');
  const [evtVenue, setEvtVenue] = useState('');
  const [evtSummary, setEvtSummary] = useState('');
  const [evtDescription, setEvtDescription] = useState('');
  const [evtRegistrationOpen, setEvtRegistrationOpen] = useState(true);
  const [evtRegistrationNote, setEvtRegistrationNote] = useState(
    'Open community event. Register online so our Care Family hosts can prepare welcome kits.'
  );
  const [evtImageUrl, setEvtImageUrl] = useState(
    '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg'
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
    setErrorNotice(null);
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const showError = (msg: string) => {
    setStatusNotice(null);
    setErrorNotice(msg);
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

  const handlePhotoUpload = async (file: File | undefined, onUrl: (url: string) => void) => {
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
    setEvtCategory(normalizeEventCategory(evt.category));
    setEvtDate(evt.dateISO);
    setEvtTime(evt.timeLabel);
    setEvtVenue(evt.venue);
    setEvtSummary(evt.summary);
    setEvtDescription(evt.description);
    setEvtRegistrationOpen(evt.registrationOpen);
    setEvtRegistrationNote(evt.registrationNote || '');
    setEvtImageUrl(evt.imageUrl);
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEvtTitle('');
    setEvtCategory('Children’s Home Visits');
    setEvtDate('2026-12-22');
    setEvtTime('09:30 – 14:30');
    setEvtVenue('');
    setEvtSummary('');
    setEvtDescription('');
    setEvtRegistrationOpen(true);
    setEvtRegistrationNote(
      'Open community event. Register online so our Care Family hosts can prepare welcome kits.'
    );
    setEvtImageUrl('/src/assets/images/doc_childrens_home_csr_1794832339445.jpg');
  };

  const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    const endpoint = editingEventId
      ? `/api/admin/events/${editingEventId}`
      : '/api/admin/events';
    const method = editingEventId ? 'PUT' : 'POST';
    try {
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
          registrationOpen: evtRegistrationOpen,
          registrationNote: evtRegistrationNote,
          imageUrl: evtImageUrl,
          featured: true,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(payload.error || 'Could not save event details. Please check required fields.');
        return;
      }
      const wasEditing = Boolean(editingEventId);
      resetEventForm();
      await loadDashboard();
      await refreshPublicSite();
      notify(wasEditing ? 'Community event updated.' : 'Community event published.');
    } catch {
      showError('Network error while saving community event.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setErrorNotice(null);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(payload.error || 'Could not remove event.');
        return;
      }
      await loadDashboard();
      await refreshPublicSite();
      notify('Community event removed.');
    } catch {
      showError('Network error while removing event.');
    }
  };

  const handleCreateImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    try {
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
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(payload.error || 'Could not publish impact story. Check required fields.');
        return;
      }
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
    } catch {
      showError('Network error while publishing impact story.');
    }
  };

  const handleDeleteImpact = async (id: string) => {
    setErrorNotice(null);
    try {
      const res = await fetch(`/api/admin/impact/${id}`, { method: 'DELETE' });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(payload.error || 'Could not remove impact story.');
        return;
      }
      await loadDashboard();
      await refreshPublicSite();
      notify('Impact story removed.');
    } catch {
      showError('Network error while removing impact story.');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle,
          message: annMessage,
          linkLabel: 'Get Support',
          linkPath: '/counselling',
          isActive: true,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(payload.error || 'Could not publish announcement.');
        return;
      }
      setAnnTitle('');
      setAnnMessage('');
      await loadDashboard();
      await refreshPublicSite();
      notify('Announcement published.');
    } catch {
      showError('Network error while publishing announcement.');
    }
  };

  const handleToggleAnnouncement = async (ann: Announcement) => {
    setErrorNotice(null);
    try {
      const res = await fetch(`/api/admin/announcements/${ann.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ann.isActive }),
      });
      if (!res.ok) {
        showError('Could not update announcement visibility.');
        return;
      }
      await loadDashboard();
      await refreshPublicSite();
    } catch {
      showError('Network error updating announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setErrorNotice(null);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        showError('Could not delete announcement.');
        return;
      }
      await loadDashboard();
      await refreshPublicSite();
    } catch {
      showError('Network error deleting announcement.');
    }
  };

  const handleSubmissionStatus = async (
    type:
      | 'prayer'
      | 'counselling'
      | 'safehome'
      | 'homevisit'
      | 'partner'
      | 'rehab'
      | 'asd'
      | 'volunteer'
      | 'contact',
    id: string,
    status: string
  ) => {
    setErrorNotice(null);
    try {
      const res = await fetch(`/api/admin/submissions/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(payload.error || 'Could not update record status.');
        return;
      }
      await loadDashboard();
      notify('Record status updated.');
    } catch {
      showError('Network error updating status.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    setErrorNotice(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(payload.error || 'Could not save public settings.');
        return;
      }
      await loadDashboard();
      await refreshPublicSite();
      notify('Site content and contact details saved.');
    } catch {
      showError('Network error while saving settings.');
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
                HIS AND HERS · Stewardship CMS
              </div>
              <h1 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                Authorised Care &amp; Admin Sign In
              </h1>
              <p className="text-sm text-[#665B73]">
                Review counselling requests, Find My Home safeguarding alerts, children’s home visit
                bookings, partner onboarding, rehab referrals, ASD family desk, and site content.
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
                  placeholder="admin@hisandhers.org"
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
                Email: <span className="font-mono">admin@hisandhers.org</span>
              </p>
              <p>
                Password: <span className="font-mono">HisAndHersAdmin!2026</span>
              </p>
              <p className="pt-1">
                Configure <span className="font-mono">ADMIN_EMAIL</span> and{' '}
                <span className="font-mono">ADMIN_PASSWORD</span> in your environment before
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
      id: 'homevisits',
      label: 'Children’s Homes',
      count: dashboard?.homeVisitBookings?.length || 0,
      icon: <CalendarCheck2 className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'partners',
      label: 'Partner Orgs',
      count: dashboard?.partnerOrganizations?.length || 0,
      icon: <Building2 className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'rehab',
      label: 'Rehab Referrals',
      count: dashboard?.rehabReferrals?.length || 0,
      icon: <LocateFixed className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'asd',
      label: 'ASD Family',
      count: dashboard?.asdSupportRequests?.length || 0,
      icon: <Sparkles className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'counselling',
      label: 'Counselling',
      count: dashboard?.counsellingRequests?.length || 0,
      icon: <MessageSquareHeart className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'safehome',
      label: 'Find My Home',
      count: dashboard?.safeHomeRequests?.length || 0,
      icon: <ShieldAlert className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'prayer',
      label: 'Prayer',
      count: dashboard?.prayerRequests?.length || 0,
      icon: <Heart className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'events',
      label: 'Events',
      count: dashboard?.events?.length || 0,
      icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'impact',
      label: 'Impact',
      count: dashboard?.impactProjects?.length || 0,
      icon: <ImagePlus className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'volunteers',
      label: 'Volunteers',
      count: dashboard?.volunteerEnquiries?.length || 0,
      icon: <Users className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'messages',
      label: 'Messages',
      count: dashboard?.contactMessages?.length || 0,
      icon: <Mail className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'announcements',
      label: 'Notices',
      count: dashboard?.announcements?.length || 0,
      icon: <Megaphone className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'settings',
      label: 'Settings',
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
              HIS AND HERS · Care &amp; Stewardship Console
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
              Community Care, Refuge &amp; Content Administration
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
            className="p-3.5 rounded-md bg-white border border-[#256358]/30 text-sm text-[#1E0B2B] flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-[#256358]" aria-hidden="true" />
            <span>{statusNotice}</span>
          </div>
        )}

        {errorNotice && (
          <div
            role="alert"
            className="p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-800"
          >
            {errorNotice}
          </div>
        )}

        {/* Navigation Tabs */}
        <div role="tablist" aria-label="Administrative sections" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md border whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#3B155F] text-white border-[#3B155F]'
                    : 'bg-white text-[#3E3349] border-[#3B155F]/15 hover:bg-[#F3EEF8]'
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

        {/* Tab: Counselling & Mental Health Requests */}
        {activeTab === 'counselling' && (
          <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Confidential Counselling &amp; Mental Health Requests
              </h2>
              <p className="text-sm text-[#665B73]">
                Private mental wellbeing and burden-sharing submissions for counsellor follow-up.
              </p>
            </div>
            {!dashboard?.counsellingRequests?.length ? (
              <p className="text-sm text-[#665B73] py-8 text-center border border-dashed border-[#3B155F]/15 rounded-md">
                No counselling requests submitted yet.
              </p>
            ) : (
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard.counsellingRequests.map((req) => (
                  <div key={req.id} className="py-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B73]">
                      <div>
                        <strong className="text-[#1E0B2B]">{req.name}</strong>
                        {req.contact && <span> · {req.contact}</span>}
                        <span> · {req.supportArea}</span>
                        <span> · {req.preferredMethod}</span>
                        <span> · {req.urgency}</span>
                      </div>
                      <span className="font-semibold uppercase text-[#7A5A10]">
                        Status: {req.status}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#1A1224] leading-relaxed">
                      {req.message}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('counselling', req.id, 'assigned')}
                        className="px-3 py-1.5 text-xs font-medium bg-[#F3EEF8] text-[#3B155F] rounded hover:bg-[#E7DFF1]"
                      >
                        Assign Counsellor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('counselling', req.id, 'completed')}
                        className="px-3 py-1.5 text-xs font-medium border border-[#3B155F]/20 text-[#3B155F] rounded"
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab: Find My Home Safe Refuge Requests */}
        {activeTab === 'safehome' && (
          <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Find My Home · Safe Refuge &amp; Protection Alerts
              </h2>
              <p className="text-sm text-[#665B73]">
                Strictly follow the survivor’s safe contact method and time window before reaching
                out.
              </p>
            </div>
            {!dashboard?.safeHomeRequests?.length ? (
              <p className="text-sm text-[#665B73] py-8 text-center border border-dashed border-[#3B155F]/15 rounded-md">
                No safe refuge alerts logged yet.
              </p>
            ) : (
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard.safeHomeRequests.map((req) => (
                  <div key={req.id} className="py-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B73]">
                      <div>
                        <strong className="text-[#1E0B2B]">{req.callerAlias}</strong>
                        <span> · {req.situationType}</span>
                        <span> · {req.peopleCount} person(s)</span>
                        <span> · Safe Contact: {req.safeContact}</span>
                        <span>
                          {' '}
                          · {req.safeToCall ? 'Safe to call' : 'DO NOT CALL (Text/Message only)'}
                        </span>
                        <span> · Window: {req.safeTimeWindow}</span>
                      </div>
                      <span className="font-semibold uppercase text-[#7A5A10]">
                        Status: {req.status}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#1A1224] leading-relaxed">
                      {req.immediateNeeds}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('safehome', req.id, 'urgent-care')}
                        className="px-3 py-1.5 text-xs font-medium bg-[#F3EEF8] text-[#3B155F] rounded hover:bg-[#E7DFF1]"
                      >
                        Active Care Coordination
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('safehome', req.id, 'sheltered')}
                        className="px-3 py-1.5 text-xs font-medium border border-[#3B155F]/20 text-[#3B155F] rounded"
                      >
                        Safe Shelter Placed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab: Children's Home Visits Coordination */}
        {activeTab === 'homevisits' && (
          <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Children’s Home Visits &amp; Corporate CSR Bookings
              </h2>
              <p className="text-sm text-[#665B73]">
                Coordinate corporate CSR teams, individuals, fellowships, and school groups visiting
                partner children’s homes.
              </p>
            </div>
            {!dashboard?.homeVisitBookings?.length ? (
              <p className="text-sm text-[#665B73] py-8 text-center border border-dashed border-[#3B155F]/15 rounded-md">
                No children’s home visit requests scheduled yet.
              </p>
            ) : (
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard.homeVisitBookings.map((visit) => (
                  <div key={visit.id} className="py-5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B73]">
                      <div>
                        <strong className="text-[#1E0B2B]">{visit.coordinatorName}</strong>
                        {visit.groupName && <span> ({visit.groupName})</span>}
                        <span> · {visit.organizerType}</span>
                        <span> · Target: {visit.selectedHomeName}</span>
                        <span> · {visit.groupSize} visitor(s)</span>
                        <span> · {visit.focusArea}</span>
                      </div>
                      <span className="font-semibold uppercase text-[#7A5A10]">
                        Status: {visit.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#3E3349] tabular-nums">
                      Preferred Date: {formatEventDate(visit.preferredDate)} (
                      {visit.preferredTimeWindow}) · Region: {visit.locationArea} · Contact:{' '}
                      {visit.email} {visit.phone && `· ${visit.phone}`}
                    </p>
                    {visit.notes && <p className="text-sm text-[#1A1224]">{visit.notes}</p>}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('homevisit', visit.id, 'scheduled')}
                        className="px-3 py-1.5 text-xs font-medium bg-[#F3EEF8] text-[#3B155F] rounded hover:bg-[#E7DFF1]"
                      >
                        Confirm &amp; Schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('homevisit', visit.id, 'completed')}
                        className="px-3 py-1.5 text-xs font-medium border border-[#3B155F]/20 text-[#3B155F] rounded"
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab: Partner Organisations Onboarding */}
        {activeTab === 'partners' && (
          <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Partner Organisation &amp; Corporate CSR Onboarding
              </h2>
              <p className="text-sm text-[#665B73]">
                Review companies, registered children’s homes, NGOs, and sponsors applying to
                cooperate.
              </p>
            </div>
            {!dashboard?.partnerOrganizations?.length ? (
              <p className="text-sm text-[#665B73] py-8 text-center border border-dashed border-[#3B155F]/15 rounded-md">
                No organisation onboarding requests submitted yet.
              </p>
            ) : (
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard.partnerOrganizations.map((partner) => (
                  <div key={partner.id} className="py-5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B73]">
                      <div>
                        <strong className="text-[#1E0B2B]">{partner.organizationName}</strong>
                        <span> · {partner.partnerType}</span>
                        <span> · Liaison: {partner.contactPerson}</span>
                        <span> · {partner.regionArea}</span>
                      </div>
                      <span className="font-semibold uppercase text-[#7A5A10]">
                        Status: {partner.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#3E3349]">
                      Email: {partner.email} {partner.phone && `· ${partner.phone}`}{' '}
                      {partner.websiteOrProfile && `· ${partner.websiteOrProfile}`}
                    </p>
                    <p className="text-sm text-[#1A1224]">{partner.collaborationFocus}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('partner', partner.id, 'onboarded')}
                        className="px-3 py-1.5 text-xs font-medium bg-[#F3EEF8] text-[#3B155F] rounded hover:bg-[#E7DFF1]"
                      >
                        Approve Onboarding
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('partner', partner.id, 'archived')}
                        className="px-3 py-1.5 text-xs font-medium border border-[#3B155F]/15 text-[#665B73] rounded"
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

        {/* Tab: Rehabilitation Facility Referrals */}
        {activeTab === 'rehab' && (
          <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Rehabilitation Facility Connection Requests
              </h2>
              <p className="text-sm text-[#665B73]">
                Confidential family referrals to nearby partner rehabilitation facilities.
              </p>
            </div>
            {!dashboard?.rehabReferrals?.length ? (
              <p className="text-sm text-[#665B73] py-8 text-center border border-dashed border-[#3B155F]/15 rounded-md">
                No rehabilitation referral requests logged yet.
              </p>
            ) : (
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard.rehabReferrals.map((ref) => (
                  <div key={ref.id} className="py-5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B73]">
                      <div>
                        <strong className="text-[#1E0B2B]">{ref.applicantName}</strong>
                        <span> ({ref.relationship})</span>
                        <span> · Facility: {ref.chosenFacilityName}</span>
                        <span> · {ref.preferredCounty}</span>
                        <span> · {ref.supportType}</span>
                      </div>
                      <span className="font-semibold uppercase text-[#7A5A10]">
                        Status: {ref.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#3E3349]">Contact: {ref.contact}</p>
                    <p className="text-sm text-[#1A1224]">{ref.notes}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('rehab', ref.id, 'matched')}
                        className="px-3 py-1.5 text-xs font-medium bg-[#EDF6F3] text-[#256358] rounded"
                      >
                        Match Facility
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('rehab', ref.id, 'in-care')}
                        className="px-3 py-1.5 text-xs font-medium border border-[#256358]/25 text-[#256358] rounded"
                      >
                        Mark In Care
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab: ASD Parents & Kids Support Requests */}
        {activeTab === 'asd' && (
          <section className="bg-white border border-[#3B155F]/12 rounded-lg p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                ASD Parents &amp; Kids Support Queue
              </h2>
              <p className="text-sm text-[#665B73]">
                Questions and parent-mentor connection requests from autism families.
              </p>
            </div>
            {!dashboard?.asdSupportRequests?.length ? (
              <p className="text-sm text-[#665B73] py-8 text-center border border-dashed border-[#3B155F]/15 rounded-md">
                No ASD family support inquiries yet.
              </p>
            ) : (
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard.asdSupportRequests.map((item) => (
                  <div key={item.id} className="py-5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#665B73]">
                      <div>
                        <strong className="text-[#1E0B2B]">{item.parentName}</strong>
                        <span> · {item.childAgeGroup}</span>
                        <span> · {item.topicNeeded}</span>
                        <span> · {item.contact}</span>
                      </div>
                      <span className="font-semibold uppercase text-[#7A5A10]">
                        Status: {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#1A1224]">{item.questionOrStory}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('asd', item.id, 'answered')}
                        className="px-3 py-1.5 text-xs font-medium bg-[#EDF6F3] text-[#256358] rounded"
                      >
                        Mark Answered
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmissionStatus('asd', item.id, 'connected')}
                        className="px-3 py-1.5 text-xs font-medium border border-[#256358]/25 text-[#256358] rounded"
                      >
                        Connected With Mentor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab: Private Prayer Requests */}
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

        {/* Tab: Events CRUD */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateOrUpdateEvent}
              className="lg:col-span-5 bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                  {editingEventId ? 'Edit Community Event' : 'Add Helping Hand Event'}
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
                    Helping Hand Focus
                  </label>
                  <select
                    id="cms-evt-cat"
                    value={evtCategory}
                    onChange={(e) => setEvtCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  >
                    {HELPING_HAND_EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
                    Time Window
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
                    Venue / Home *
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
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="cms-evt-rsvp-open"
                    type="checkbox"
                    checked={evtRegistrationOpen}
                    onChange={(e) => setEvtRegistrationOpen(e.target.checked)}
                    className="w-4 h-4 accent-[#3B155F] rounded"
                  />
                  <label htmlFor="cms-evt-rsvp-open" className="text-xs font-medium text-[#1E0B2B]">
                    Enable online RSVP form for this event
                  </label>
                </div>
                <div>
                  <label htmlFor="cms-evt-rsvp-note" className="block text-xs font-medium mb-1">
                    Participation / Coordination Note
                  </label>
                  <input
                    id="cms-evt-rsvp-note"
                    value={evtRegistrationNote}
                    onChange={(e) => setEvtRegistrationNote(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cms-evt-upload" className="block text-xs font-medium mb-1">
                  Upload Event Photo (Optional)
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
                {editingEventId ? 'Save Event Changes' : 'Publish Community Event'}
              </button>
            </form>

            <div className="lg:col-span-7 bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
                Published Helping Hand Events &amp; RSVPs ({dashboard?.eventRegistrations.length || 0}{' '}
                {(dashboard?.eventRegistrations.length || 0) === 1 ? 'RSVP' : 'RSVPs'})
              </h2>
              <div className="divide-y divide-[#3B155F]/10">
                {dashboard?.events.map((evt) => (
                  <div key={evt.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#C2593F] font-semibold">
                        {evt.category} ·{' '}
                        <span className="tabular-nums text-[#7A5A10]">
                          {formatEventDate(evt.dateISO)}
                        </span>
                      </p>
                      <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                        {evt.title}
                      </h3>
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
                        aria-label={`Delete event ${evt.title}`}
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

        {/* Tab: Impact Stories CRUD */}
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

        {/* Tab: Volunteer Enquiries */}
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

        {/* Tab: Contact Messages & Event Registrations */}
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

        {/* Tab: Announcements */}
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

        {/* Tab: Site Content & Contact Settings */}
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
                <label htmlFor="set-org" className="block text-xs font-medium mb-1">
                  Organisation Name
                </label>
                <input
                  id="set-org"
                  value={settingsForm.organisationName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, organisationName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-md"
                />
              </div>
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
            </div>
            <div>
              <label htmlFor="set-emergency" className="block text-xs font-medium mb-1">
                Emergency Crisis Hotline Notice
              </label>
              <input
                id="set-emergency"
                value={settingsForm.emergencyHotlineNote}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, emergencyHotlineNote: e.target.value })
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
