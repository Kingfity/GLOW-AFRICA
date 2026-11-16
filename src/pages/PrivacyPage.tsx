import { AppLink } from '../context/RouterContext';

export function PrivacyPage() {
  return (
    <div className="bg-[#FAF7F2] py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-8">
        <div className="space-y-3 pb-6 border-b border-[#3B155F]/12">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
            Privacy &amp; Data Stewardship
          </p>
          <h1 className="font-serif text-4xl font-semibold text-[#1E0B2B]">
            Privacy Policy
          </h1>
        </div>

        <div className="space-y-6 text-base text-[#3E3349] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              1. Respectful Handling of Prayer Requests
            </h2>
            <p>
              Prayer requests submitted through GLOW Church Africa are treated with strict pastoral
              confidentiality. Requests are never published or displayed publicly on this website.
              Visitors may submit requests anonymously without providing a name or contact address.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              2. Volunteer, Event &amp; Contact Information
            </h2>
            <p>
              When you register for a gathering, volunteer for an outreach initiative, or send a
              contact message, we collect only the details you provide so authorised GLOW
              coordinators can respond warmly and coordinate hospitality. We never sell or share
              your details with third-party marketers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
              3. Access &amp; Removal Requests
            </h2>
            <p>
              You may ask for any personal submission to be updated or removed at any time by
              reaching out through our{' '}
              <AppLink href="/contact" className="text-[#3B155F] underline underline-offset-4">
                Contact page
              </AppLink>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
