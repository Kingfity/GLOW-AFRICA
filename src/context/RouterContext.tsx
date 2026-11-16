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
    title: 'GLOW Church Africa | More Than a Place to Gather. A Place to Belong.',
    description:
      'An interdenominational prayer and worship movement demonstrating God’s love through spiritual fellowship, compassionate service, and community outreach since 2024.',
  },
  {
    match: (p) => p === '/about',
    title: 'About Us | GLOW Church Africa',
    description:
      'Discover the story, mission, vision, and interdenominational identity of GLOW Church Africa—where faith meets practical compassion.',
  },
  {
    match: (p) => p === '/prayer-worship',
    title: 'Prayer & Worship | GLOW Church Africa',
    description:
      'Explore prayer gatherings, corporate worship, and submit a confidential prayer request to be held in prayer by our team.',
  },
  {
    match: (p) => p.startsWith('/impact'),
    title: 'Our Impact Since 2024 | GLOW Church Africa',
    description:
      'Documented community outreach, acts of compassion, and charitable initiatives carried out by GLOW Church Africa since 2024.',
  },
  {
    match: (p) => p.startsWith('/events'),
    title: 'Events & Gatherings | GLOW Church Africa',
    description:
      'View upcoming worship gatherings, prayer watches, special services, and community outreach activities.',
  },
  {
    match: (p) => p === '/get-involved',
    title: 'Get Involved | GLOW Church Africa',
    description:
      'Join the prayer movement, attend worship gatherings, volunteer in community initiatives, or partner with GLOW Church Africa.',
  },
  {
    match: (p) => p === '/contact',
    title: 'Contact Us | GLOW Church Africa',
    description:
      'Connect with GLOW Church Africa by email, phone, WhatsApp, or visit one of our gatherings.',
  },
  {
    match: (p) => p === '/privacy',
    title: 'Privacy & Stewardship Policy | GLOW Church Africa',
    description:
      'How GLOW Church Africa safeguards prayer requests, personal contact details, and volunteer information.',
  },
  {
    match: (p) => p === '/admin',
    title: 'Stewardship CMS | GLOW Church Africa',
    description: 'Authorised administrative portal for GLOW Church Africa.',
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
