import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppLink, useRouter } from '../context/RouterContext';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Prayer & Worship', href: '/prayer-worship' },
  { label: 'Our Impact', href: '/impact' },
  { label: 'Events', href: '/events' },
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'Contact', href: '/contact' },
];

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx="14"
        cy="14"
        r="12.5"
        stroke={light ? '#D4AF37' : '#3B155F'}
        strokeWidth="1.5"
      />
      <path
        d="M14 5.5C15.8 9.2 18.8 11.4 18.8 15.2C18.8 17.9 16.65 20.1 14 20.1C11.35 20.1 9.2 17.9 9.2 15.2C9.2 11.4 12.2 9.2 14 5.5Z"
        stroke={light ? '#FAF7F2' : '#9A7418'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 11.5V22.5M10.5 15.2H17.5"
        stroke={light ? '#D4AF37' : '#3B155F'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Navbar() {
  const { path } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    return path === href || path.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#3B155F]/12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 lg:h-[72px] flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <AppLink
          href="/"
          className="inline-flex items-center gap-2.5 text-[#1E0B2B] whitespace-nowrap shrink-0"
        >
          <BrandMark />
          <span className="font-serif text-xl sm:text-[22px] font-semibold tracking-tight whitespace-nowrap">
            GLOW Church Africa
          </span>
        </AppLink>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#3E3349]"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <AppLink
                key={item.href}
                href={item.href}
                ariaCurrent={active ? 'page' : undefined}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors duration-150 border-b-2 ${
                  active
                    ? 'text-[#3B155F] border-[#B88F28] font-semibold'
                    : 'border-transparent hover:text-[#3B155F] hover:border-[#3B155F]/30'
                }`}
              >
                {item.label}
              </AppLink>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <AppLink
            href="/prayer-worship"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Request Prayer
          </AppLink>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-[#1E0B2B] hover:bg-[#3B155F]/8 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="lg:hidden bg-[#FAF7F2] border-t border-[#3B155F]/12 px-5 py-4 space-y-1"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <AppLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                ariaCurrent={active ? 'page' : undefined}
                className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  active
                    ? 'bg-[#F3EEF8] text-[#3B155F] font-semibold'
                    : 'text-[#1A1224] hover:bg-[#F3EEF8]/70'
                }`}
              >
                {item.label}
              </AppLink>
            );
          })}
          <div className="pt-3 border-t border-[#3B155F]/10">
            <AppLink
              href="/prayer-worship"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] rounded-md"
            >
              Request Prayer
            </AppLink>
          </div>
        </nav>
      )}
    </header>
  );
}
