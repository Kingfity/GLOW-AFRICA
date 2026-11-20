import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  path: '/',
  navigate: () => {},
});

const ROUTE_META: Array<{ match: (p: string) => boolean; title: string; description: string }> = [
  {
    match: (p) => p === '/',
    title: 'His & Hers Circle of Hope | Ruiru Care Family Home · Est. 2025',
    description:
      'His & Hers Circle of Hope began in 2025 in Ruiru, Kiambu County—connecting neighbours, elders, children’s homes, special needs families, trauma & mental health support, nearby rehabilitation, and safe refuge across 47 counties.',
  },
  {
    match: (p) => p === '/about',
    title: 'Our Story & Ruiru Origin (Est. 2025) | His & Hers Circle of Hope',
    description:
      'Discover how His & Hers Circle of Hope grew in Ruiru, Kiambu County—walking with elders, Ruiru Boys student homes, and Nancy Kariuki with the GLOW Prayer Movement.',
  },
  {
    match: (p) => p === '/leadership' || p === '/administrators' || p === '/help',
    title: 'Conveners, Administrators & Help Desk | His & Hers Circle of Hope',
    description:
      'Reach conveners Nancy Kariuki & GLOW Prayer Movement or our programme and help coordinators at His & Hers Circle of Hope.',
  },
  {
    match: (p) => p === '/home-visits',
    title: 'Children’s Homes & Schools for Differently Abled | His & Hers Circle of Hope',
    description:
      'Book individual, group, or corporate CSR visits to verified children’s homes and inclusive schools across Kenya, or onboard your organisation.',
  },
  {
    match: (p) => p === '/special-needs-families' || p === '/special-needs',
    title: 'Special Needs Kids & Families | His & Hers Circle of Hope',
    description:
      'Direct support for single-parent and two-parent families raising children with disabilities—speaking directly with mothers and guardians in charge across all 47 counties.',
  },
  {
    match: (p) => p === '/rehabilitation',
    title: 'Rehabilitation & Recovery Facilities Near You | His & Hers Circle of Hope',
    description:
      'Find nearby addiction recovery, trauma healing, and youth rehabilitation centres sorted by proximity or county and connect confidentially.',
  },
  {
    match: (p) => p === '/mental-health' || p === '/asd-support' || p === '/quiet-rest',
    title: 'Mental Health, Trauma & Stress Healing | His & Hers Circle of Hope',
    description:
      'Trauma-informed listening, 4-4-6 nervous system grounding plans, caregiver fatigue relief, and Kenyan crisis support across 47 counties.',
  },
  {
    match: (p) => p === '/counselling',
    title: 'Talk to a Counsellor | His & Hers Circle of Hope',
    description:
      'Talk to a counsellor or mental health professional and lighten your burdens in a confidential, stigma-free space.',
  },
  {
    match: (p) => p === '/find-my-home',
    title: 'Find My Home · Safe Refuge Support | His & Hers Circle of Hope',
    description:
      'Confidential safe shelter referral and protection support for survivors fleeing gender-based violence and child abuse.',
  },
  {
    match: (p) => p === '/prayer-worship',
    title: 'Prayer & Worship | His & Hers Circle of Hope',
    description:
      'Explore prayer gatherings, GLOW Prayer Movement fellowship, and submit a confidential prayer request.',
  },
  {
    match: (p) => p.startsWith('/impact'),
    title: 'Our Impact Since 2025 | His & Hers Circle of Hope',
    description:
      'Documented Ruiru ward walks, blankets and staples for elders and Ruiru Boys, children’s home visits, and live transparent stewardship since 2025.',
  },
  {
    match: (p) => p.startsWith('/events'),
    title: 'Helping Hand Events & Christmas of Hope | His & Hers Circle of Hope',
    description:
      'Browse upcoming children’s home visit days, trauma healing circles, Nov 28 feast tables, and Christmas of Hope gatherings for elders.',
  },
  {
    match: (p) => p === '/get-involved',
    title: 'Get Involved | His & Hers Circle of Hope',
    description:
      'Volunteer, sponsor a children’s home visit, bring unga and blankets for elders, or partner with His & Hers Circle of Hope.',
  },
  {
    match: (p) => p === '/contact',
    title: 'Contact Us | His & Hers Circle of Hope',
    description:
      'Connect with His & Hers Circle of Hope in Ruiru by email, phone, WhatsApp, or visit our Care Family Hub.',
  },
  {
    match: (p) => p === '/privacy',
    title: 'Privacy & Safeguarding Policy | His & Hers Circle of Hope',
    description:
      'How His & Hers Circle of Hope protects children’s homes, counselling disclosures, mental health notes, rehabilitation referrals, and safe-refuge requests.',
  },
  {
    match: (p) => p === '/accountability',
    title: 'Accountability — Open Books | His & Hers Circle of Hope',
    description:
      'We keep the books open. Inspect our 82% programs / 12% admin / 6% fundraising breakdown, Follow a Dollar breakdown, Annual Report, Audited Financials, and Form 990.',
  },
  {
    match: (p) => p.startsWith('/gbv'),
    title: 'Family Wellness & Quiet Notes | His & Hers Circle of Hope',
    description:
      'Calm household planning, wellness checklists, and county community contacts with zero tracking or cookies.',
  },
  {
    match: (p) => p.startsWith('/recovery'),
    title: 'Recovery Support & Family Care (Kenya & East Africa) | His & Hers Circle of Hope',
    description:
      'You do not have to do this alone. Confidential Kenyan & East African recovery pathways, peer stories, family guide, and 47-county support.',
  },
  {
    match: (p) => p === '/admin',
    title: 'Stewardship CMS | His & Hers Circle of Hope',
    description: 'Authorised care and administrative portal for His & Hers Circle of Hope.',
  },
];

function updateDocumentMeta(pathname: string) {
  const entry = ROUTE_META.find((r) => r.match(pathname)) || ROUTE_META[0];
  document.title = entry.title;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) {
    descTag.setAttribute('content', entry.description);
  }
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    updateDocumentMeta(path);
  }, [path]);

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const currentlyIsolated =
      window.location.pathname.startsWith('/gbv') ||
      window.location.pathname.startsWith('/recovery');
    const targetGbv = to.startsWith('/gbv');
    const targetRecovery = to.startsWith('/recovery');

    // Enforce true fresh HTTP request with no-store headers & zero third-party links when entering isolated hubs
    if (!currentlyIsolated && (targetGbv || targetRecovery)) {
      window.location.assign(to);
      return;
    }
    if (
      (window.location.pathname.startsWith('/gbv') && !targetGbv) ||
      (window.location.pathname.startsWith('/recovery') && !targetRecovery)
    ) {
      window.location.assign(to);
      return;
    }

    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}

export function AppLink({
  href,
  className = '',
  children,
  onClick,
  ariaLabel,
  ariaCurrent,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  ariaCurrent?: 'page' | undefined;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
        onClick?.();
      }}
      className={className}
    >
      {children}
    </a>
  );
}
