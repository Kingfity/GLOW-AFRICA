import { CareGuideChatbot } from './components/CareGuideChatbot';
import { EmergencyAuthorityAlert } from './components/EmergencyAuthorityAlert';
import { FloatingVolunteerWidget } from './components/FloatingVolunteerWidget';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1224]">
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
    <RouterProvider>
      <ColourMoodProvider>
        <SiteDataProvider>
          <AppShell />
        </SiteDataProvider>
      </ColourMoodProvider>
    </RouterProvider>
  );
}
