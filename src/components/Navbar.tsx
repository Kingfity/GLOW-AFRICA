import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppLink, useRouter } from '../context/RouterContext';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Children’s Homes', href: '/home-visits' },
  { label: 'Recovery', href: '/recovery' },
  { label: 'Family Wellness', href: '/gbv' },
  { label: 'Accountability', href: '/accountability' },
  { label: 'Events', href: '/events' },
];

export function BrandMark({
  light = false,
  size = 'md',
}: {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const royalPlum = light ? '#F3D79B' : '#3B155F';
  const warmTerracotta = light ? '#F3A683' : '#C2593F';
  const royalGold = light ? '#F5D67B' : '#D4AF37';
  const deepGold = light ? '#FAF7F2' : '#7A5A10';
  const sageLeaf = light ? '#84B5A9' : '#256358';
  const hearthGlow = light ? '#F5D67B' : '#FDF0D5';
  const dim = size === 'sm' ? 32 : size === 'lg' ? 56 : 40;

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Subtle Royal Crest Shield Halo */}
      <path
        d="M24 3C34.5 3 43 11.2 43 22.5C43 34.5 34.2 42.6 24 45C13.8 42.6 5 34.5 5 22.5C5 11.2 13.5 3 24 3Z"
        fill={light ? '#2B1045' : '#FAF3E6'}
        stroke={royalGold}
        strokeWidth="1.4"
        strokeOpacity={light ? '0.65' : '0.85'}
      />
      {/* Warm Sunlit Hearth Interior Glow */}
      <circle
        cx="24"
        cy="26"
        r="12.5"
        fill={hearthGlow}
        fillOpacity={light ? '0.16' : '0.85'}
      />
      {/* Three-Pointed Royal Crown Crest Above the Home Gable */}
      <path
        d="M17.5 13L19.2 8.2L24 11L28.8 8.2L30.5 13H17.5Z"
        fill={royalGold}
        stroke={deepGold}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <circle cx="19.2" cy="7.4" r="1.1" fill={warmTerracotta} />
      <circle cx="24" cy="6.6" r="1.3" fill={royalGold} />
      <circle cx="28.8" cy="7.4" r="1.1" fill={warmTerracotta} />
      {/* Sheltering Homely Gable & Courtyard Pillars */}
      <path
        d="M10.5 23L24 12.6L37.5 23"
        stroke={royalPlum}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 22V36.5H33.5V22"
        stroke={royalPlum}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Living Sage Olive Wreath Sprigs Framing the Home */}
      <path
        d="M13.8 35.5C9.8 32.8 9.2 27.6 12.3 24.4C14.1 27.4 14.6 31.4 13.8 35.5Z"
        fill={sageLeaf}
        fillOpacity="0.9"
      />
      <path
        d="M34.2 35.5C38.2 32.8 38.8 27.6 35.7 24.4C33.9 27.4 33.4 31.4 34.2 35.5Z"
        fill={sageLeaf}
        fillOpacity="0.9"
      />
      {/* Warm Family Figures (His, Hers & Child Held Safely Within Hearth) */}
      <circle cx="19.1" cy="23.8" r="2.2" fill={royalPlum} />
      <circle cx="28.9" cy="23.8" r="2.2" fill={warmTerracotta} />
      <circle cx="24" cy="26.8" r="1.85" fill={royalGold} />
      <path
        d="M16.5 34.8C16.8 30.2 17.8 28.2 19.3 28.2C20.7 28.2 21.6 30 21.9 34.8"
        fill={royalPlum}
      />
      <path
        d="M26.1 34.8C26.4 30 27.3 28.2 28.7 28.2C30.2 28.2 31.2 30.2 31.5 34.8"
        fill={warmTerracotta}
      />
      <path
        d="M21.8 35C22 32 22.9 30.4 24 30.4C25.1 30.4 26 32 26.2 35"
        fill={royalGold}
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
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 lg:h-[76px] flex items-center justify-between gap-4 xl:gap-6">
        {/* Zone 1: Royal & Homely Crest Emblem + Wordmark */}
        <AppLink
          href="/"
          className="inline-flex items-center gap-2.5 text-[#1E0B2B] whitespace-nowrap shrink-0"
        >
          <BrandMark />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-xl sm:text-[22px] font-semibold tracking-tight whitespace-nowrap">
              HIS AND HERS
            </span>
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#7A5A10]">
              Care Family · Est. 2025
            </span>
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
            { label: 'Rehabilitation', href: '/rehabilitation' },
            { label: 'ASD Family', href: '/asd-support' },
            { label: 'Mental Health & Counselling', href: '/counselling' },
            { label: 'Find My Home · Calm Refuge', href: '/find-my-home' },
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
