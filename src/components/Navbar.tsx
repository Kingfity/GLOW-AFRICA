import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppLink, useRouter } from '../context/RouterContext';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Children’s Homes', href: '/home-visits' },
  { label: 'Rehabilitation', href: '/rehabilitation' },
  { label: 'ASD Family', href: '/asd-support' },
  { label: 'Mental Health', href: '/counselling' },
  { label: 'Safe Refuge', href: '/find-my-home' },
  { label: 'Events', href: '/events' },
];

export function BrandMark({ light = false }: { light?: boolean }) {
  const roofStroke = light ? '#E5CA7B' : '#3B155F';
  const warmAccent = light ? '#F3A683' : '#C2593F';
  const goldAccent = light ? '#FAF7F2' : '#B88F28';

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Sheltering Care Family Home Roof */}
      <path
        d="M4.5 14.5L16 4.8L27.5 14.5"
        stroke={roofStroke}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Warm Hearth Heart Bridge beneath the Roof */}
      <path
        d="M8.5 26.5V16.2M23.5 26.5V16.2M8.5 26.5H23.5"
        stroke={roofStroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Connected Family Figures (His, Hers, and Child in Care) */}
      <circle cx="12.2" cy="15.4" r="1.75" fill={roofStroke} />
      <circle cx="19.8" cy="15.4" r="1.75" fill={warmAccent} />
      <circle cx="16" cy="18.2" r="1.45" fill={goldAccent} />
      <path
        d="M10.4 23.6C10.4 21.4 11.4 20.1 12.6 20.1C13.7 20.1 14.5 21.1 14.7 23.6M17.3 23.6C17.5 21.1 18.3 20.1 19.4 20.1C20.6 20.1 21.6 21.4 21.6 23.6M14.3 24.4C14.5 22.8 15.2 21.8 16 21.8C16.8 21.8 17.5 22.8 17.7 24.4"
        stroke={warmAccent}
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
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 lg:h-[74px] flex items-center justify-between gap-4 xl:gap-6">
        {/* Zone 1: Care Family Home Emblem + Wordmark */}
        <AppLink
          href="/"
          className="inline-flex items-center gap-2.5 text-[#1E0B2B] whitespace-nowrap shrink-0"
        >
          <BrandMark />
          <span className="font-serif text-xl sm:text-[22px] font-semibold tracking-tight whitespace-nowrap">
            HIS AND HERS
          </span>
        </AppLink>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-4 xl:gap-5 text-[13px] xl:text-sm font-medium text-[#3E3349]"
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
                    ? 'text-[#3B155F] border-[#C2593F] font-semibold'
                    : 'border-transparent hover:text-[#3B155F] hover:border-[#D4AF37]'
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
            href="/get-involved"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Get Involved
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
          className="lg:hidden bg-[#FAF7F2] border-t border-[#3B155F]/12 px-5 py-4 space-y-1 max-h-[80vh] overflow-y-auto"
        >
          {[
            ...NAV_ITEMS,
            { label: 'About Us', href: '/about' },
            { label: 'Our Impact', href: '/impact' },
            { label: 'Prayer & Worship', href: '/prayer-worship' },
            { label: 'Contact', href: '/contact' },
          ].map((item) => {
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
              href="/get-involved"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] rounded-md"
            >
              Get Involved
            </AppLink>
          </div>
        </nav>
      )}
    </header>
  );
}
