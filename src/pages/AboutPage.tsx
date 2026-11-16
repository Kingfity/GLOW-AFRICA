import { ArrowRight } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { SafeImage } from '../components/SafeImage';

export function AboutPage() {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-[#1E0B2B] text-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              About GLOW Church Africa
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              One Movement. Many Stories. One Expression of God’s Love.
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              GLOW Church Africa is an interdenominational prayer and worship movement committed to
              creating a spiritual home where worship and compassionate action walk hand in hand.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are & Story Since 2024 */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                  Who We Are &amp; How Our Story Began
                </h2>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  GLOW Church Africa began with a simple conviction: people do not need another
                  exclusive institution—they need a sincere place of refuge where God is sought in
                  prayer and neighbours are loved in practical ways.
                </p>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Since 2024, believers from varied Christian backgrounds have come together under
                  this shared calling. Rather than operating solely inside four walls, GLOW has
                  cultivated a rhythm of corporate prayer, heartfelt worship, and steady outreach into
                  surrounding neighbourhoods.
                </p>
              </div>

              <div className="pt-6 border-t border-[#3B155F]/15 space-y-4">
                <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                  Why GLOW Exists
                </h2>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Too often, spiritual devotion and practical mercy are treated as separate worlds.
                  GLOW exists to bring them back together—nurturing a community where intercession
                  moves our feet toward people facing hardship, loneliness, or transition.
                </p>
              </div>

              <div className="pt-6 border-t border-[#3B155F]/15 space-y-4">
                <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                  Our Interdenominational Identity
                </h2>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Whether you belong to a historic church tradition, attend a local fellowship, or
                  are exploring Christian faith anew, you are welcome here. We honour the wider
                  Body of Christ and invite people from every denomination, background, and walk of
                  life to pray, worship, and serve together in unity.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#3B155F]/12">
                <SafeImage
                  src="/src/assets/images/impact_education_youth_1794821888567.jpg"
                  alt="Community mentors and youth sharing conversation around wooden tables"
                  className="w-full h-full object-cover"
                />
              </div>
              <figure className="text-xs text-[#665B73] italic">
                Shared tables of encouragement and community partnership—reflecting GLOW’s belief
                that belonging grows through authentic presence.
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#3B155F]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              Our Mission
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
              Prayer, Fellowship &amp; Compassionate Action
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              To cultivate an interdenominational prayer and worship community where every person
              can encounter God’s grace, find genuine belonging, and demonstrate Christ’s love
              through meaningful service to vulnerable and local communities.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              Our Vision
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
              Communities Restored by Living Faith
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              To see individuals, families, and neighbourhoods across Africa strengthened through
              united prayer, spiritual renewal, and consistent acts of mercy that honour human
              dignity.
            </p>
          </div>
        </div>
      </section>

      {/* Commitment CTA */}
      <section className="py-16 sm:py-20 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
            Walk With Us in Prayer and Service
          </h2>
          <p className="text-base text-[#3E3349] leading-relaxed">
            Explore our documented outreach since 2024 or join us at an upcoming gathering.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <AppLink
              href="/impact"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors"
            >
              See Our Impact
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
            <AppLink
              href="/get-involved"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8] transition-colors"
            >
              Get Involved
            </AppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
