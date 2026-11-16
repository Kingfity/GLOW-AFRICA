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
    title: 'HIS AND HERS | A Care Family Home Connecting Lives to Hope',
    description:
      'HIS AND HERS connects families, corporates, and communities to children’s homes, mental health counselling, nearby rehabilitation facilities, ASD family care, and safe refuge.',
  },
  {
    match: (p) => p === '/about',
    title: 'About Us | HIS AND HERS Care Family Home',
    description:
      'Learn about HIS AND HERS—a warm community-based care family hub touching lives through children’s home partnerships, rehabilitation support, mental health care, and prayer.',
  },
  {
    match: (p) => p === '/home-visits',
    title: 'Children’s Homes & Corporate Partner Visits | HIS AND HERS',
    description:
      'Book individual, group, or corporate CSR visits to verified children’s homes, or onboard your organisation to cooperate with HIS AND HERS.',
  },
  {
    match: (p) => p === '/rehabilitation',
    title: 'Rehabilitation & Recovery Facilities Near You | HIS AND HERS',
    description:
      'Find nearby addiction recovery, trauma healing, and youth rehabilitation centres sorted by proximity or county and connect confidentially.',
  },
  {
    match: (p) => p === '/asd-support',
    title: 'ASD Parents & Kids Living Support Hub | HIS AND HERS',
    description:
      'Easy, friendly guides and practical daily living tips for parents and families raising children on the autism spectrum, plus parent mentor support.',
  },
  {
    match: (p) => p === '/counselling',
    title: 'Mental Health & Counselling | HIS AND HERS',
    description:
      'Talk to a counsellor or mental health professional and lighten your burdens in a confidential, stigma-free space.',
  },
  {
    match: (p) => p === '/find-my-home',
    title: 'Find My Home · Safe Refuge Support | HIS AND HERS',
    description:
      'Confidential safe shelter referral and protection support for survivors fleeing gender-based violence and child abuse.',
  },
  {
    match: (p) => p === '/prayer-worship',
    title: 'Prayer & Worship | HIS AND HERS',
    description:
      'Explore prayer gatherings, worship fellowship, and submit a confidential prayer request.',
  },
  {
    match: (p) => p.startsWith('/impact'),
    title: 'Our Impact Since 2024 | HIS AND HERS',
    description:
      'Documented children’s home visits, ASD workshops, rehabilitation partnerships, and community outreach carried out by HIS AND HERS.',
  },
  {
    match: (p) => p.startsWith('/events'),
    title: 'Events & Gatherings | HIS AND HERS',
    description:
      'View upcoming children’s home visit days, ASD family mornings, mental health circles, and worship gatherings.',
  },
  {
    match: (p) => p === '/get-involved',
    title: 'Get Involved | HIS AND HERS',
    description:
      'Volunteer, sponsor a children’s home visit, onboard your company or NGO, or partner with HIS AND HERS.',
  },
  {
    match: (p) => p === '/contact',
    title: 'Contact Us | HIS AND HERS',
    description:
      'Connect with HIS AND HERS by email, phone, WhatsApp, or visit our Care Family Hub.',
  },
  {
    match: (p) => p === '/privacy',
    title: 'Privacy & Safeguarding Policy | HIS AND HERS',
    description:
      'How HIS AND HERS protects children’s homes, counselling disclosures, rehabilitation referrals, safe-refuge requests, and ASD families.',
  },
  {
    match: (p) => p === '/admin',
    title: 'Stewardship CMS | HIS AND HERS',
    description: 'Authorised care and administrative portal for HIS AND HERS.',
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
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'auto' });
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
