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
  const roofStroke = light ? '#F3D79B' : '#3B155F';
  const warmTerracotta = light ? '#F3A683' : '#C2593F';
  const goldAccent = light ? '#FAF7F2' : '#D4AF37';
  const sageLeaf = light ? '#84B5A9' : '#256358';

  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Warm sunlit doorway halo */}
      <circle
        cx="18"
        cy="19"
        r="12"
        fill={goldAccent}
        fillOpacity={light ? '0.16' : '0.22'}
      />
      {/* Sheltering home eaves & timber roof */}
      <path
        d="M4.5 16.5L18 5.2L31.5 16.5"
        stroke={roofStroke}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Home foundation walls */}
      <path
        d="M9 29.5V17.5M27 29.5V17.5M7 29.5H29"
        stroke={roofStroke}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Organic caring leaf sprigs cradling the hearth */}
      <path
        d="M9.5 28.5C6.5 26 6.2 21.5 8.8 19.2C10.2 21.8 10.6 25.2 9.5 28.5Z"
        fill={sageLeaf}
        fillOpacity="0.88"
      />
      <path
        d="M26.5 28.5C29.5 26 29.8 21.5 27.2 19.2C25.8 21.8 25.4 25.2 26.5 28.5Z"
        fill={sageLeaf}
        fillOpacity="0.88"
      />
      {/* Lifelike connected family silhouettes (Parents & Child) */}
      <circle cx="13.2" cy="17.2" r="2.1" fill={roofStroke} />
      <circle cx="22.8" cy="17.2" r="2.1" fill={warmTerracotta} />
      <circle cx="18" cy="20.1" r="1.75" fill={goldAccent} />
      <path
        d="M11 27.4C11.2 23.4 12.2 21.4 13.5 21.4C14.7 21.4 15.5 23 15.8 27.4"
        fill={roofStroke}
        fillOpacity="0.9"
      />
      <path
        d="M20.2 27.4C20.5 23 21.3 21.4 22.5 21.4C23.8 21.4 24.8 23.4 25 27.4"
        fill={warmTerracotta}
        fillOpacity="0.92"
      />
      <path
        d="M15.8 27.8C16 25 16.8 23.6 18 23.6C19.2 23.6 20 25 20.2 27.8"
        fill={goldAccent}
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
