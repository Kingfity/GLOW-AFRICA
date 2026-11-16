import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { BrandMark } from './Navbar';

export function Footer() {
  const { data } = useSiteData();
  const settings = data?.settings;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1E0B2B] text-[#FAF7F2] border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        {/* Closing Commitment Statement */}
        <div className="pb-12 mb-12 border-b border-white/12 max-w-3xl">
          <p className="font-serif italic text-2xl sm:text-3xl leading-snug text-[#FAF7F2]">
            “
            {settings?.closingStatement ||
              'At GLOW, we believe that love should be experienced, faith should be lived and no one should have to walk alone.'}
            ”
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Identity & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <AppLink href="/" className="inline-flex items-center gap-2.5 text-[#FAF7F2]">
              <BrandMark light />
              <span className="font-serif text-xl font-semibold tracking-tight">
                {settings?.organisationName || 'GLOW Church Africa'}
              </span>
            </AppLink>
            <p className="text-sm leading-relaxed text-[#FAF7F2]/80 max-w-sm">
              An interdenominational Christian prayer and worship movement demonstrating God’s love
              through spiritual fellowship, compassionate service, and community care since 2024.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Explore GLOW
            </h2>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/85">
              <li>
                <AppLink href="/about" className="hover:text-[#E5CA7B] transition-colors">
                  About Us &amp; Our Story
                </AppLink>
              </li>
              <li>
                <AppLink href="/prayer-worship" className="hover:text-[#E5CA7B] transition-colors">
                  Prayer &amp; Worship
                </AppLink>
              </li>
              <li>
                <AppLink href="/impact" className="hover:text-[#E5CA7B] transition-colors">
                  Our Impact Since 2024
                </AppLink>
              </li>
              <li>
                <AppLink href="/events" className="hover:text-[#E5CA7B] transition-colors">
                  Events &amp; Gatherings
                </AppLink>
              </li>
              <li>
                <AppLink href="/get-involved" className="hover:text-[#E5CA7B] transition-colors">
                  Get Involved
                </AppLink>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Connect With Us
            </h2>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/85">
              <li>{settings?.primaryLocationLabel || 'Primary Gathering Centre'}</li>
              <li>
                <a
                  href={`mailto:${settings?.contactEmail || 'hello@glowchurchafrica.org'}`}
                  className="hover:text-[#E5CA7B] transition-colors underline decoration-white/25 underline-offset-4"
                >
                  {settings?.contactEmail || 'hello@glowchurchafrica.org'}
                </a>
              </li>
              <li className="tabular-nums">
                <a
                  href={`tel:${(settings?.contactPhone || '').replace(/\s+/g, '')}`}
                  className="hover:text-[#E5CA7B] transition-colors"
                >
                  {settings?.contactPhone || '+254 700 000 000'}
                </a>
              </li>
              <li>
                <AppLink href="/contact" className="hover:text-[#E5CA7B] transition-colors">
                  Contact &amp; Directions
                </AppLink>
              </li>
            </ul>
          </div>

          {/* Stewardship & Community Links */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Community
            </h2>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/85">
              {settings?.instagramUrl && (
                <li>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#E5CA7B] transition-colors"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {settings?.facebookUrl && (
                <li>
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#E5CA7B] transition-colors"
                  >
                    Facebook
                  </a>
                </li>
              )}
              {settings?.youtubeUrl && (
                <li>
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#E5CA7B] transition-colors"
                  >
                    YouTube
                  </a>
                </li>
              )}
              <li>
                <AppLink href="/privacy" className="hover:text-[#E5CA7B] transition-colors">
                  Privacy Policy
                </AppLink>
              </li>
              <li>
                <AppLink href="/admin" className="hover:text-[#E5CA7B] transition-colors text-[#FAF7F2]/70">
                  Admin Portal
                </AppLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Credit Row */}
        <div className="mt-14 pt-6 border-t border-white/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#FAF7F2]/70">
          <p className="tabular-nums">
            © {year} {settings?.organisationName || 'GLOW Church Africa'}. All rights reserved.
          </p>
          <p>Digital platform developed by Aurel Tech Ventures.</p>
        </div>
      </div>
    </footer>
  );
}
