import { AppLink } from '../context/RouterContext';
import { useSiteData } from '../context/SiteDataContext';
import { PrayerRequestForm } from '../components/PrayerRequestForm';
import { SafeImage } from '../components/SafeImage';

const PRAYER_RHYTHMS = [
  {
    index: '01.',
    title: 'Worship Gatherings',
    detail:
      'Christ-centred gatherings marked by unhurried worship, scripture reading, and space for personal reflection across traditions.',
  },
  {
    index: '02.',
    title: 'Intercessory Prayer',
    detail:
      'Dedicated prayer stewards lifting up confidential requests submitted by community members, families, and neighbours.',
  },
  {
    index: '03.',
    title: 'Corporate Prayer Watches',
    detail:
      'Scheduled weekly and special gatherings where believers stand together in faith for communities, leaders, and peace.',
  },
  {
    index: '04.',
    title: 'Spiritual Fellowship',
    detail:
      'Warm tables and small prayer circles where newcomers are welcomed personally and no one walks through life alone.',
  },
];

export function PrayerWorshipPage() {
  const { data } = useSiteData();
  const settings = data?.settings;

  return (
    <div>
      {/* Header */}
      <section className="bg-[#1E0B2B] text-[#FAF7F2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#E5CA7B]">
              Prayer &amp; Worship
            </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight">
                The Spiritual Heart of HIS AND HERS
              </h1>
              <p className="text-base sm:text-lg text-[#FAF7F2]/85 leading-relaxed">
                “
                {settings?.prayerInvitation ||
                  'Whatever season of life you find yourself in, you do not have to carry everything alone. We would be honoured to listen, counsel, and stand with you.'}
                ”
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="aspect-[16/10] rounded-lg overflow-hidden border border-white/15">
                <SafeImage
                  src="/src/assets/images/worship_gathering_sanctuary_1794821887938.jpg"
                  alt="Evening sanctuary lit warmly for prayer and worship"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Rhythms of Prayer & Worship */}
        <section className="py-16 sm:py-20 bg-white border-b border-[#3B155F]/10">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12 space-y-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                How We Gather
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                Prayer, Intercession &amp; Fellowship
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PRAYER_RHYTHMS.map((r) => (
                <div key={r.index} className="pt-5 border-t border-[#3B155F]/15 space-y-2">
                  <p className="text-xs font-semibold text-[#7A5A10] tabular-nums">{r.index}</p>
                  <h3 className="font-serif text-2xl font-semibold text-[#1E0B2B]">{r.title}</h3>
                  <p className="text-sm text-[#3E3349] leading-relaxed">{r.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prayer Request Submission + Gathering Schedule Note */}
        <section className="py-16 sm:py-24 bg-[#FAF7F2]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7A5A10]">
                Confidential Care
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E0B2B]">
                We Will Pray With You
              </h2>
              <p className="text-base text-[#3E3349] leading-relaxed">
                Every prayer request shared through this page is held in strict confidence. Our
                intercessory stewards review requests privately—never displaying them publicly—and lift
                each need in prayer. Looking to talk with a mental health counsellor as well?{' '}
                <AppLink
                  href="/counselling"
                  className="text-[#3B155F] font-semibold underline underline-offset-4"
                >
                  Visit our Counselling Space
                </AppLink>
                .
              </p>
            <div className="bg-white border border-[#3B155F]/12 rounded-lg p-6 space-y-3">
              <h3 className="font-serif text-xl font-semibold text-[#1E0B2B]">
                Attending a Worship Gathering
              </h3>
              <p className="text-sm text-[#3E3349] leading-relaxed">
                {settings?.gatheringScheduleSummary ||
                  'Weekly Prayer Watches & Worship Gatherings (See Events schedule)'}
              </p>
              <p className="text-sm text-[#665B73]">
                {settings?.primaryLocationLabel || 'Primary Gathering Centre'}
              </p>
              <div className="pt-2">
                <AppLink
                  href="/events"
                  className="text-sm font-semibold text-[#3B155F] hover:text-[#7A5A10] underline underline-offset-4"
                >
                  View Upcoming Worship &amp; Prayer Dates
                </AppLink>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <PrayerRequestForm />
          </div>
        </div>
      </section>
    </div>
  );
}
