import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { BrandMark } from './Navbar';

export function Footer() {
  const { data } = useSiteData();
  const settings = data?.settings;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1E0B2B] text-[#FAF7F2] border-t border-[#D4AF37]/25">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        {/* Closing Commitment Statement */}
        <div className="pb-12 mb-12 border-b border-white/12 max-w-3xl">
          <p className="font-serif italic text-2xl sm:text-3xl leading-snug text-[#FAF7F2]">
            “
            {settings?.closingStatement ||
              'At HIS AND HERS, we are a care family home where every child is seen, every burden is shared, and families find clear pathways to healing.'}
            ”
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Identity & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <AppLink href="/" className="inline-flex items-center gap-3 text-[#FAF7F2]">
              <BrandMark light />
              <span className="flex flex-col leading-none">
                <span className="font-serif text-xl font-semibold tracking-tight">
                  {settings?.organisationName || 'HIS AND HERS'}
                </span>
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#E5CA7B]">
                  Care Family Home · Est. 2025
                </span>
              </span>
            </AppLink>
            <p className="text-sm leading-relaxed text-[#FAF7F2]/80 max-w-sm">
              A care family community connecting individuals, parents, corporates, and partner
              organisations to children’s homes, mental health counselling, rehabilitation centres,
              ASD family resources, and safe refuge.
            </p>
          </div>

          {/* Care Family Pathways */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Care Family Pathways
            </h2>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/85">
              <li>
                <AppLink href="/home-visits" className="hover:text-[#F3A683] transition-colors">
                  Children’s Homes &amp; Corporate Visits
                </AppLink>
              </li>
              <li>
                <AppLink href="/rehabilitation" className="hover:text-[#F3A683] transition-colors">
                  Rehabilitation Centres Near You
                </AppLink>
              </li>
              <li>
                <AppLink href="/asd-support" className="hover:text-[#F3A683] transition-colors">
                  ASD Parents &amp; Kids Support
                </AppLink>
              </li>
              <li>
                <AppLink href="/counselling" className="hover:text-[#F3A683] transition-colors">
                  Talk to a Counsellor
                </AppLink>
              </li>
              <li>
                <AppLink href="/find-my-home" className="hover:text-[#F3A683] transition-colors">
                  Find My Home (Safe Refuge)
                </AppLink>
              </li>
              <li>
                <AppLink href="/prayer-worship" className="hover:text-[#F3A683] transition-colors">
                  Prayer &amp; Worship
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
              <li>{settings?.primaryLocationLabel || 'HIS AND HERS Care Family Hub'}</li>
              <li>
                <a
                  href={`mailto:${settings?.contactEmail || 'care@hisandhers.org'}`}
                  className="hover:text-[#E5CA7B] transition-colors underline decoration-white/25 underline-offset-4"
                >
                  {settings?.contactEmail || 'care@hisandhers.org'}
                </a>
              </li>
              <li className="tabular-nums">
                <a
                  href={`tel:${(settings?.contactPhone || '+254700000000').replace(/\s+/g, '')}`}
                  className="hover:text-[#E5CA7B] transition-colors"
                >
                  {settings?.contactPhone || '+254 700 000 000'}
                </a>
              </li>
              <li>
                <AppLink href="/events" className="hover:text-[#E5CA7B] transition-colors">
                  Events &amp; Gatherings
                </AppLink>
              </li>
              <li>
                <AppLink href="/contact" className="hover:text-[#E5CA7B] transition-colors">
                  Contact &amp; Directions
                </AppLink>
              </li>
            </ul>
          </div>

          {/* Community & Governance */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Community
            </h2>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/85">
              <li>
                <AppLink href="/about" className="hover:text-[#E5CA7B] transition-colors">
                  About Us
                </AppLink>
              </li>
              <li>
                <AppLink href="/impact" className="hover:text-[#E5CA7B] transition-colors">
                  Our Impact Since 2025
                </AppLink>
              </li>
              <li>
                <AppLink href="/get-involved" className="hover:text-[#E5CA7B] transition-colors">
                  Get Involved
                </AppLink>
              </li>
              <li>
                <AppLink href="/privacy" className="hover:text-[#E5CA7B] transition-colors">
                  Privacy &amp; Safeguarding
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
            © {year} {settings?.organisationName || 'HIS AND HERS'}. All rights reserved.
          </p>
          <p>Digital platform developed by Aurel Tech Ventures.</p>
        </div>
      </div>
    </footer>
  );
}
