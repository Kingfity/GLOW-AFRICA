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
              About HIS AND HERS
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Making the World Better by Touching Lives in Our Community
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
              HIS AND HERS is a community-based organization shaped by faith, compassion, mental
              health advocacy, and practical refuge—standing beside women, men, youth, and children
              in moments of need.
            </p>
          </div>
        </div>
      </section>

      {/* Story & Core Commitments */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                  Who We Are &amp; Why We Exist
                </h2>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Born from a shared calling since 2024, HIS AND HERS brings together spiritual
                  fellowship and front-line community care. We believe healing touches the whole
                  person—mind, body, spirit, and home.
                </p>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  That is why our work spans confidential mental health counselling to help people
                  lighten silent burdens, our Find My Home desk supporting survivors fleeing
                  gender-based violence and child abuse, rehabilitation facility referrals, ASD family
                  guidance, prayer support, and organised children’s home visits for corporate teams
                  and volunteers.
                </p>
              </div>

              <div className="pt-6 border-t border-[#3B155F]/15 space-y-4">
                <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
                  Interdenominational &amp; Inclusive Welcome
                </h2>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  No one has to fit a single background, denomination, or circumstance to receive
                  care or serve alongside us. Every neighbour—his and hers, young and old—deserves
                  safety, encouragement, and belonging.
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
                Shared tables of encouragement and community partnership—reflecting HIS AND HERS’s
                commitment to dignity and human presence.
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
              Mental Wellbeing, Safe Refuge &amp; Living Compassion
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              To stand alongside individuals and families through accessible counselling, protective
              shelter coordination against abuse, prayer fellowship, and organised community
              service visits.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              Our Vision
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
              Whole Hearts and Safe Homes in Every Neighbourhood
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              A world made measurably kinder where emotional struggles are met with empathy, homes
              are free from violence, and communities actively show up for one another.
            </p>
          </div>
        </div>
      </section>

      {/* Commitment CTA */}
      <section className="py-16 sm:py-20 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
            Walk With Us or Reach Out Today
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <AppLink
              href="/counselling"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#3B155F] hover:bg-[#2C1042] rounded-md transition-colors"
            >
              Talk to a Counsellor
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
              <AppLink
                href="/home-visits"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8] transition-colors"
              >
                Organize a Children’s Home Visit
              </AppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
