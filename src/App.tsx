import { useEffect, useState } from 'react';
import { CareGuideChatbot } from './components/CareGuideChatbot';
import { EmergencyAuthorityAlert } from './components/EmergencyAuthorityAlert';
import { FirestoreErrorBoundary } from './components/FirestoreErrorBoundary';
import { FloatingVolunteerWidget } from './components/FloatingVolunteerWidget';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { ColourMoodProvider } from './context/ColourMoodContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { SiteDataProvider } from './context/SiteDataContext';
import { AboutPage } from './pages/AboutPage';
import { AccountabilityPage } from './pages/AccountabilityPage';
import { AdminPage } from './pages/AdminPage';
import { ContactPage } from './pages/ContactPage';
import { CounsellingPage } from './pages/CounsellingPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { EventsPage } from './pages/EventsPage';
import { FindMyHomePage } from './pages/FindMyHomePage';
import { GbvSafePage } from './pages/GbvSafePage';
import { GetInvolvedPage } from './pages/GetInvolvedPage';
import { HomePage } from './pages/HomePage';
import { HomeVisitsPage } from './pages/HomeVisitsPage';
import { ImpactDetailPage } from './pages/ImpactDetailPage';
import { ImpactPage } from './pages/ImpactPage';
import { LeadershipHelpPage } from './pages/LeadershipHelpPage';
import { MentalHealthTraumaPage } from './pages/MentalHealthTraumaPage';
import { PartnersGrantsPage } from './pages/PartnersGrantsPage';
import { PrayerWorshipPage } from './pages/PrayerWorshipPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RecoverySectionPage } from './pages/RecoverySectionPage';
import { RehabilitationPage } from './pages/RehabilitationPage';
import { SpecialNeedsFamiliesPage } from './pages/SpecialNeedsFamiliesPage';

function PageView({ normalized }: { normalized: string }) {
  if (normalized === '/') return <HomePage />;
  if (normalized === '/about') return <AboutPage />;
  if (normalized === '/leadership' || normalized === '/administrators' || normalized === '/help') {
    return <LeadershipHelpPage />;
  }
  if (normalized === '/accountability') return <AccountabilityPage />;
  if (normalized === '/partners' || normalized === '/grants' || normalized === '/sponsors') {
    return <PartnersGrantsPage />;
  }
  if (normalized === '/home-visits') return <HomeVisitsPage />;
  if (normalized === '/special-needs-families' || normalized === '/special-needs') {
    return <SpecialNeedsFamiliesPage />;
  }
  if (normalized === '/rehabilitation') return <RehabilitationPage />;
  if (normalized === '/mental-health' || normalized === '/asd-support' || normalized === '/quiet-rest') {
    return <MentalHealthTraumaPage />;
  }
  if (normalized === '/counselling') return <CounsellingPage />;
  if (normalized === '/find-my-home') return <FindMyHomePage />;
  if (normalized === '/gbv' || normalized.startsWith('/gbv/')) return <GbvSafePage />;
  if (normalized === '/recovery' || normalized.startsWith('/recovery/')) {
    return <RecoverySectionPage />;
  }
  if (normalized === '/prayer-worship') return <PrayerWorshipPage />;
  if (normalized === '/impact') return <ImpactPage />;
  if (normalized.startsWith('/impact/')) {
    return <ImpactDetailPage slug={normalized.replace('/impact/', '')} />;
  }
  if (normalized === '/events') return <EventsPage />;
  if (normalized.startsWith('/events/')) {
    return <EventDetailPage slug={normalized.replace('/events/', '')} />;
  }
  if (normalized === '/get-involved') return <GetInvolvedPage />;
  if (normalized === '/contact') return <ContactPage />;
  if (normalized === '/privacy') return <PrivacyPage />;
  if (normalized === '/admin') return <AdminPage />;

  return <HomePage />;
}

function AppShell() {
  const { path } = useRouter();
  const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
  const isPrivacyIsolated =
    normalized === '/gbv' ||
    normalized.startsWith('/gbv/') ||
    normalized === '/recovery' ||
    normalized.startsWith('/recovery/');

  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1224]">
      {quotaExceeded && !isPrivacyIsolated && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#3B155F] focus:text-[#FAF7F2] focus:rounded-md"
      >
        Skip to main content
      </a>
      {!isPrivacyIsolated && <Navbar />}
      <main id="main-content" className="flex-1">
        <div key={normalized} className="page-transition">
          <PageView normalized={normalized} />
        </div>
      </main>
      <Footer />
      <CareGuideChatbot />
      <FloatingVolunteerWidget />
      <EmergencyAuthorityAlert />
    </div>
  );
}

export default function App() {
  return (
    <FirestoreErrorBoundary>
      <RouterProvider>
        <AuthProvider>
          <ColourMoodProvider>
            <SiteDataProvider>
              <AppShell />
            </SiteDataProvider>
          </ColourMoodProvider>
        </AuthProvider>
      </RouterProvider>
    </FirestoreErrorBoundary>
  );
}
