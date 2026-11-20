import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { BrandMark } from './Navbar';

export function Footer() {
  const { data } = useSiteData();
  const settings = data?.settings;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1E0B2B] text-[#FAF7F2] border-t border-[#D4AF37]/25">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 lg:py-18">
        {/* Closing Commitment Statement */}
        <div className="pb-10 mb-10 border-b border-white/12 max-w-3xl">
          <p className="font-serif italic text-2xl sm:text-3xl leading-snug text-[#FAF7F2]">
            “
            {settings?.closingStatement ||
              'At His & Hers Circle of Hope, whether you come because you could use a hand or because you have one to offer, karibu sana—there is room for you in our circle.'}
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
                  {settings?.organisationName || 'His & Hers Circle of Hope'}
                </span>
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#E5CA7B]">
                  Ruiru, Kiambu · Est. 2025 · 47 Counties
                </span>
              </span>
            </AppLink>
            <p className="text-sm leading-relaxed text-[#FAF7F2]/80 max-w-sm">
              Founded in 2025 in Ruiru, Kiambu County—connecting neighbours, elders, children’s
              homes, special needs kids &amp; mothers, trauma &amp; mental health circles,
              rehabilitation, and safe refuge across all 47 Kenyan counties.
            </p>
          </div>

          {/* Care Family Pathways */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Circle of Hope Pathways
            </h2>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/85">
              <li>
                <AppLink href="/home-visits" className="hover:text-[#F3A683] transition-colors">
                  Children’s Homes &amp; Special Schools
                </AppLink>
              </li>
              <li>
                <AppLink
                  href="/special-needs-families"
                  className="hover:text-[#F3A683] transition-colors"
                >
                  Special Needs Kids &amp; Families
                </AppLink>
              </li>
              <li>
                <AppLink href="/mental-health" className="hover:text-[#F3A683] transition-colors">
                  Mental Health, Trauma &amp; Stress
                </AppLink>
              </li>
              <li>
                <AppLink href="/recovery" className="hover:text-[#F3A683] transition-colors">
                  Recovery &amp; Family Healing Hub
                </AppLink>
              </li>
              <li>
                <AppLink href="/rehabilitation" className="hover:text-[#F3A683] transition-colors">
                  Rehabilitation Centres Across 47 Counties
                </AppLink>
              </li>
              <li>
                <AppLink href="/counselling" className="hover:text-[#F3A683] transition-colors">
                  Talk to a Counsellor
                </AppLink>
              </li>
              <li>
                <AppLink href="/gbv" className="hover:text-[#F3A683] transition-colors">
                  Family Wellness &amp; Calm Corner
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
              <li>{settings?.primaryLocationLabel || 'His & Hers Circle of Hope · Ruiru, Kiambu'}</li>
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
                  Christmas of Hope &amp; Nov 28 Feast
                </AppLink>
              </li>
              <li>
                <AppLink href="/find-my-home" className="hover:text-[#E5CA7B] transition-colors">
                  Find My Home · Safe Refuge
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
              Trust &amp; Stewardship
            </h2>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/85">
              <li>
                <AppLink href="/accountability" className="hover:text-[#E5CA7B] transition-colors">
                  Accountability (Open Books)
                </AppLink>
              </li>
              <li>
                <AppLink href="/partners" className="hover:text-[#E5CA7B] transition-colors">
                  Institutional Partners &amp; Grants
                </AppLink>
              </li>
              <li>
                <AppLink href="/leadership" className="hover:text-[#E5CA7B] transition-colors">
                  Administrators &amp; Help Desk
                </AppLink>
              </li>
              <li>
                <AppLink href="/about" className="hover:text-[#E5CA7B] transition-colors">
                  Our Ruiru Origin Story
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

        {/* "How We Protect You" Footer Block on EVERY Page (including /gbv/ and /recovery/) */}
        <section
          aria-label="How We Protect You"
          className="mt-12 pt-8 border-t border-white/15 space-y-4"
        >
          <h2 className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
            How We Protect You
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#FAF7F2]/72 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="text-sm shrink-0">
                🚫
              </span>
              <span>
                We never load third-party tracking scripts, analytics, or advertising cookies on your
                visit.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="text-sm shrink-0">
                🔒
              </span>
              <span>
                Our private safety and recovery planners stay strictly inside your browser memory
                with zero server transmission.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span aria-hidden="true" className="text-sm shrink-0">
                🗑️
              </span>
              <span>
                Sensitive support pages enforce no-cache headers so you can erase local tools or
                leave immediately at any moment.
              </span>
            </li>
          </ul>
          <div>
            <AppLink
              href="/privacy"
              className="inline-flex items-center text-xs font-medium text-[#E5CA7B] hover:text-[#FAF7F2] transition-colors underline underline-offset-4 decoration-[#E5CA7B]/40"
            >
              Read our full privacy promise →
            </AppLink>
          </div>
        </section>

        {/* Legal & Credit Row */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#FAF7F2]/65">
          <p className="tabular-nums">
            © {year} {settings?.organisationName || 'His & Hers Circle of Hope'}. All rights reserved.
          </p>
          <p>Digital platform developed by Aurel Tech Ventures.</p>
        </div>
      </div>
    </footer>
  );
}
