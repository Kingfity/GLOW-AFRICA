import { AppLink } from '../context/RouterContext';

export function PrivacyPage() {
  return (
    <div className="bg-[#FAF7F2] py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-8">
        <div className="space-y-3 pb-6 border-b border-[#3B155F]/12">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
            Privacy &amp; Safeguarding Stewardship
          </p>
          <h1 className="font-serif text-4xl font-semibold text-[#1E0B2B]">
            Privacy &amp; Safeguarding Policy
          </h1>
        </div>

        <div className="space-y-6 text-base text-[#3E3349] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              1. Counselling, Mental Health &amp; Prayer Confidentiality
            </h2>
            <p>
              Counselling requests, mental health disclosures, and prayer submissions shared through
              HIS AND HERS are handled with strict confidentiality. They are never published or
              displayed publicly. Visitors may choose anonymous submission when lightening their
              burdens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              2. Find My Home · Safe Refuge Protection
            </h2>
            <p>
              Safe refuge requests from individuals fleeing gender-based violence or child abuse are
              restricted exclusively to authorised safeguarding leads. We follow your explicit safe
              contact instructions (such as text-only or safe calling hours) to protect your
              physical safety.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              3. Children’s Home Visits, Rehab Referrals, ASD Family Desk &amp; Partners
            </h2>
            <p>
              Information provided for children’s home visit coordination, corporate or NGO
              onboarding, rehabilitation facility referrals, ASD parent support, or volunteer
              applications is used solely to coordinate care safely and responsibly. We never sell
              or share personal information with third-party marketers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              4. Access &amp; Removal Requests
            </h2>
            <p>
              You may ask for any personal record to be updated or removed at any time by reaching
              out through our{' '}
              <AppLink href="/contact" className="text-[#3B155F] underline underline-offset-4">
                Contact page
              </AppLink>
              .
            </p>
          </section>

          <section className="bg-[#EAF6F2] border border-[#256358]/25 rounded-xl p-6 space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#1D4E46]">
              5. How We Protect You on Our Quiet Wellness &amp; Recovery Spaces
            </h2>
            <p className="text-sm text-[#3E3349]">
              Every page inside our Family Wellness quiet corner (<code className="text-[#256358]">/gbv/</code>)
              and substance use recovery space (<code className="text-[#256358]">/recovery/</code>)
              runs under strict zero-trace isolation:
            </p>
            <ul className="space-y-2 text-sm text-[#1A1224]">
              <li>
                🚫 <strong>No Tracking or Analytics:</strong> Zero Google Analytics, zero third-party
                scripts, zero image beacons, and zero cookies are ever loaded.
              </li>
              <li>
                🔒 <strong>Client-Memory Only &amp; No-Cache Headers:</strong> Safety planners and
                checklists run purely in browser memory while HTTP{' '}
                <code>no-store, no-cache, must-revalidate</code> headers prevent sensitive history caching.
              </li>
              <li>
                🗑️ <strong>Instant Screen Exit &amp; Wipe:</strong> Every isolated page displays a
                high-contrast <em>Leave this site 🚪</em> escape button and one-tap memory clearing.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
