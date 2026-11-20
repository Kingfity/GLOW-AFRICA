import { ArrowRight, HeartHandshake, Users } from 'lucide-react';
import { AppLink } from '../context/RouterContext';
import { SafeImage } from '../components/SafeImage';

export function AboutPage() {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-[#1E0B2B] via-[#3B155F] to-[#7B2E3C] text-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              About His &amp; Hers Circle of Hope · Ruiru, Kiambu County · Est. 2025
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              Bringing Neighbours Together Long After an Outreach Day Ends
            </h1>
            <p className="text-base sm:text-lg text-[#FAF7F2]/88 leading-relaxed">
              We are a community-based organisation born from Christian faith and neighbourly love—so
              an elder living alone knows whom to call, and a family carrying quiet weight never has
              to stand unseen.
            </p>
          </div>
        </div>
      </section>

      {/* Continuous Origin & Ongoing Movement Story */}
      <section className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#C2593F]">
                  Where Our Circle Began (2025) &amp; Keeps Growing
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                  From Quiet Need Next Door to an Ongoing Circle of Care
                </h2>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Here in <strong>Ruiru, Kiambu County</strong>, an elder may be wondering what to
                  cook for supper while a neighbour just a few doors away has spare <em>unga</em>{' '}
                  ready to share. Often the neighbour never knows, and the elder finds it hard to ask.
                  In <strong>2025</strong>, we founded <strong>His &amp; Hers Circle of Hope</strong>{' '}
                  to close that quiet distance and bring those neighbours together.
                </p>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  Moved by our Christian faith, we wanted to build a steady community-based
                  organisation people could rely on long after a single outreach day had ended. We
                  wanted an older neighbour living alone to always know whom to call—and a mother or
                  guardian caring for a child with a disability, or someone carrying heavy trauma
                  and stress, to have someone sit beside them and genuinely ask,{' '}
                  <em>“And how are you doing?”</em>
                </p>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  That commitment keeps unfolding step by step. In <strong>2026</strong>, our
                  conveners <strong>Nancy Kariuki</strong> and the{' '}
                  <strong>GLOW Prayer Movement</strong>, together with neighbours and well-wishers,
                  walked and prayed across <strong>four Ruiru wards</strong>. Along that walk, our
                  community gathered warm blankets for our elders alongside maize flour, rice, and
                  sugar for student homes at <strong>Ruiru Boys</strong>—sharing unhurried meals
                  and words of encouragement together.
                </p>
                <p className="text-base text-[#3E3349] leading-relaxed">
                  The same steady rhythm guides us every season—from mental health, trauma &amp;
                  stress care, dedicated special needs family accompaniment, rehabilitation
                  referrals, and safe refuge coordination across all 47 counties, to preparing for
                  our annual <strong>Christmas of Hope</strong> and Nov 28 tables where we sit down
                  to share a warm meal with our elders, listen to their stories, and pack
                  nourishing food for them to carry home.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#D4AF37]/45 space-y-3">
                <p className="font-serif italic text-2xl sm:text-[26px] text-[#1E0B2B] leading-snug">
                  “Whether you come because you could use a hand or because you have one to offer,{' '}
                  <span className="text-[#C2593F]">karibu sana</span>. There is room for you in our
                  circle.”
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#3B155F]/15 shadow-sm">
                <SafeImage
                  src="/src/assets/images/ruiru_elder_outreach_1795094869017.jpg"
                  alt="Kenyan neighbour handing warm folded blankets and staple food parcels of maize flour and sugar to a smiling elder on a sunlit veranda in Ruiru"
                  className="w-full h-full object-cover"
                />
              </div>
              <figure className="text-xs text-[#665B73] leading-relaxed">
                35mm field documentary capture: sharing warm blankets, maize flour, and company on a
                sunlit veranda in Ruiru, Kiambu County—turning quiet distance into neighbourly care.
              </figure>

              <div className="bg-[#FDF6EE] border border-[#C2593F]/20 rounded-xl p-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C2593F] inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  Meet Our Conveners &amp; Administrators
                </p>
                <p className="text-sm text-[#3E3349] leading-relaxed">
                  Reach Nancy Kariuki, the GLOW Prayer Movement conveners, or our care and admin
                  help desks coordinating ongoing ward visits and support.
                </p>
                <AppLink
                  href="/leadership"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B155F] hover:text-[#C2593F]"
                >
                  Open Administrators &amp; Help Desk
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </AppLink>
              </div>
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
              Calm Hearts, Safe Refuge &amp; Steady Neighbourly Care
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              To stand alongside elders, youth, mothers, and families long after outreach days
              conclude through accessible counselling, trauma &amp; mental health care, special
              needs family accompaniment, protective shelter coordination, rehabilitation bridges,
              and children’s home partnerships.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
              Our Vision
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#1E0B2B]">
              Whole Hearts and Warm Tables in Every Neighbourhood
            </h2>
            <p className="text-base text-[#3E3349] leading-relaxed">
              Communities across Ruiru, Kenya’s 47 counties, and East and Central Africa where
              nobody eats in silent hunger, trauma and special-needs caregiving are met with steady
              support, and every home walks in safety and dignity.
            </p>
          </div>
        </div>
      </section>

      {/* Commitment CTA */}
      <section className="py-16 sm:py-20 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#256358]">
            <HeartHandshake className="w-4 h-4" aria-hidden="true" />
            His &amp; Hers Circle of Hope
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
            Walk With Us or Reach Out Today
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <AppLink
              href="/special-needs-families"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#C2593F] hover:bg-[#A64831] rounded-md transition-colors"
            >
              Special Needs Kids &amp; Families
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
            <AppLink
              href="/mental-health"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF7F2] bg-[#256358] hover:bg-[#1D4E46] rounded-md transition-colors"
            >
              Mental Health &amp; Trauma Care
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </AppLink>
            <AppLink
              href="/leadership"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#3B155F] border border-[#3B155F]/25 rounded-md hover:bg-[#F3EEF8] transition-colors"
            >
              Administrators &amp; Help
            </AppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
