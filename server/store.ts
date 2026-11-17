import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  Announcement,
  AsdGuideTip,
  AsdSupportRequest,
  ChildrensHome,
  ContactMessage,
  CounsellingRequest,
  EmergencyAuthorityAlert,
  EventItem,
  EventRegistration,
  HomeVisitBooking,
  ImpactProject,
  PartnerOrganization,
  PrayerRequest,
  PublicSiteData,
  RehabFacility,
  RehabReferralRequest,
  SafeHomeRequest,
  SiteSettings,
  VillageContributionItem,
  VolunteerEnquiry,
} from '../src/shared/types.ts';
import { normalizeEventCategory } from '../src/utils/validation.ts';

export interface AppDatabase {
  settings: SiteSettings;
  announcements: Announcement[];
  impactProjects: ImpactProject[];
  events: EventItem[];
  childrensHomes: ChildrensHome[];
  rehabFacilities: RehabFacility[];
  asdGuides: AsdGuideTip[];
  villageContributions: VillageContributionItem[];
  prayerRequests: PrayerRequest[];
  counsellingRequests: CounsellingRequest[];
  safeHomeRequests: SafeHomeRequest[];
  homeVisitBookings: HomeVisitBooking[];
  partnerOrganizations: PartnerOrganization[];
  rehabReferrals: RehabReferralRequest[];
  asdSupportRequests: AsdSupportRequest[];
  volunteerEnquiries: VolunteerEnquiry[];
  contactMessages: ContactMessage[];
  eventRegistrations: EventRegistration[];
  emergencyAlerts: EmergencyAuthorityAlert[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hisandhers-db.json');

function createSeedDatabase(): AppDatabase {
  const now = new Date().toISOString();
  return {
    settings: {
      organisationName: 'HIS AND HERS',
      tagline: 'Care Family Home. Touching Lives. Connecting Families to What They Need.',
      heroHeadline: 'A Care Family Home That Connects Everyone to Hope.',
      heroSubheadline:
        'HIS AND HERS is a vibrant community-based organization rooted in prayer, mental wellbeing, safe refuge, children’s home partnerships, rehabilitation support, and autism family care—uniting individuals, families, and organisations to touch lives together.',
      welcomeHeadline: 'Where Individuals, Families & Partner Organisations Build Stronger Homes',
      welcomeBody:
        'Like a true care family home, HIS AND HERS connects people directly to what they need: corporate and group visits to verified children’s homes, mental health counselling to lighten heavy burdens, nearby rehabilitation centres for families in recovery, safe refuge from abuse, and practical ASD guidance for parents and kids.',
      prayerInvitation:
        'Whatever season your family or heart is walking through, you do not have to navigate it alone. We are here to listen, connect you to real care, and stand beside you.',
      closingStatement:
        'At HIS AND HERS, we are a care family home where every child is seen, every burden is shared, and families find clear pathways to healing.',
      primaryLocationLabel: 'HIS AND HERS Care Family Hub · Nairobi',
      primaryAddress: 'Karen & Lang’ata Care Coordination Hub (Directions Shared Upon Booking)',
      gatheringScheduleSummary: 'Children’s Home Visits · Mental Health Circles · ASD Parent Care · Safe Refuge',
      contactEmail: 'care@hisandhers.org',
      contactPhone: '+254 700 000 000',
      whatsappNumber: '254700000000',
      emergencyHotlineNote:
        'If you or a child is in immediate physical danger, please call your local police or national emergency hotline immediately before submitting an online request.',
      instagramUrl: 'https://instagram.com/hisandherscommunity',
      facebookUrl: 'https://facebook.com/hisandherscommunity',
      youtubeUrl: 'https://youtube.com/@hisandherscommunity',
      approvedGivingNote:
        'Stewardship, children’s home sponsorships, and rehabilitation aid are coordinated strictly through verified HIS AND HERS channels confirmed directly by our leadership team.',
      updatedAt: now,
    },
    announcements: [
      {
        id: 'ann-nov28',
        title: 'Nov 28 Thanksgiving Feast & Early Christmas Initiative',
        message:
          'Join us on 28 November as we feed families across the community and share relief token bundles to cushion hard times.',
        linkLabel: 'View Initiative & RSVP',
        linkPath: '/events/november-28-thanksgiving-feast-and-early-christmas-relief',
        isActive: true,
        publishedAt: now,
      },
      {
        id: 'ann-1',
        title: 'Care Family Hub Open Across Kenya · Expanding East & Central Africa',
        message:
          'Plan a visit to Children’s Homes or Schools for the Differently Abled across Kenya, connect with rehabilitation across 47 counties, or explore Accountability, Recovery & Family Wellness.',
        linkLabel: 'Explore Homes & Schools',
        linkPath: '/home-visits',
        isActive: true,
        publishedAt: now,
      },
    ],
    childrensHomes: [
      {
        id: 'ch-1',
        name: 'Amani Gardens Children’s Home',
        institutionType: 'Children’s Home',
        regionGroup: 'Nairobi',
        specialization: 'Family-Style Residential Care & Reading',
        countyRegion: 'Nairobi',
        townArea: 'Karen / Lang’ata',
        childrenAgeRange: 'Ages 3 – 16 (42 Children)',
        currentNeeds: ['Reading Books & Art Kits', 'Nutritious Pantry Packs', 'Youth Career Mentorship'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'A warm residential family-style children’s home welcoming corporate CSR days, weekend storytelling circles, and sustained mentorship partnerships.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Volunteers and children laughing and reading storybooks together in a sunlit children home courtyard',
      },
      {
        id: 'ch-2',
        name: 'Tumaini Bridge Haven',
        institutionType: 'Children’s Home',
        regionGroup: 'Central',
        specialization: 'Primary & Secondary Education Support',
        countyRegion: 'Kiambu',
        townArea: 'Thika / Ruiru',
        childrenAgeRange: 'Ages 5 – 17 (56 Children)',
        currentNeeds: ['School Uniforms & Shoes', 'Sports & Music Equipment', 'Solar Study Lamps'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Community children’s home focused on education continuity, creative arts, and structured group mentoring visits from corporate teams and youth fellowships.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Mentors and students seated around wooden tables with books in a warm classroom',
      },
      {
        id: 'ch-3',
        name: 'Neema Cradle Care Home',
        institutionType: 'Children’s Home',
        regionGroup: 'Rift Valley',
        specialization: 'Infant & Early Childhood Sanctuary',
        countyRegion: 'Nakuru',
        townArea: 'Milimani / Nakuru',
        childrenAgeRange: 'Ages 0 – 10 (28 Children)',
        currentNeeds: ['Infant Formula & Diapers', 'Bedding & Warm Blankets', 'Playroom Renovations'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Safe early-childhood sanctuary supporting rescued infants and primary-school children with gentle caregiver accompaniment and small-group volunteer days.',
        imageUrl: '/src/assets/images/impact_community_outreach_1794821887071.jpg',
        imageAlt: 'Care volunteers organizing fresh produce and care hampers in a sunny courtyard',
      },
      {
        id: 'ch-4',
        name: 'Pwani Light Children’s Centre',
        institutionType: 'Children’s Home',
        regionGroup: 'Coast',
        specialization: 'Youth Life Skills & Coastal Care',
        countyRegion: 'Mombasa',
        townArea: 'Nyali / Bamburi',
        childrenAgeRange: 'Ages 6 – 18 (38 Children)',
        currentNeeds: ['STEM & Coding Laptops', 'Dry Food Staples', 'Vocational Life Skills'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Coastal residential home preparing older teens and children for bright futures through corporate skills workshops, tutoring visits, and community support.',
        imageUrl: '/src/assets/images/prayer_fellowship_circle_1794821886765.jpg',
        imageAlt: 'Caregivers and visitors seated warmly in fellowship conversation',
      },
      {
        id: 'ch-5',
        name: 'Kenya Children’s Homes (Thomas Barnardo House)',
        institutionType: 'Children’s Home',
        regionGroup: 'Nairobi',
        specialization: 'Rescue, Rehabilitation & Family Reintegration',
        countyRegion: 'Nairobi',
        townArea: 'Lang’ata Road',
        childrenAgeRange: 'Ages 0 – 18 (120+ Children)',
        currentNeeds: ['School Tuition Sponsorship', 'Fresh Food Supplies', 'Youth Mentors'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'One of Kenya’s historic child welfare homes running rescue care, community schooling, and dignified family reintegration programs.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Children and community mentors reading under courtyard shade',
      },
      {
        id: 'ch-6',
        name: 'Mama Ngina Children’s Home',
        institutionType: 'Children’s Home',
        regionGroup: 'Nairobi',
        specialization: 'Orphaned & Vulnerable Child Care',
        countyRegion: 'Nairobi',
        townArea: 'South C / Muhoho Avenue',
        childrenAgeRange: 'Ages 0 – 14 (65 Children)',
        currentNeeds: ['Nutritious Grain & Milk', 'Winter Pullovers', 'Storybooks'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Long-standing Nairobi residential care sanctuary sheltering abandoned and orphaned children in a warm family setting.',
        imageUrl: '/src/assets/images/impact_community_outreach_1794821887071.jpg',
        imageAlt: 'Community pantry baskets and learning kits sorted warmly',
      },
      {
        id: 'ch-7',
        name: 'Nyumbani Children’s Home',
        institutionType: 'Children’s Home',
        regionGroup: 'Nairobi',
        specialization: 'Medical Care & Holistic Childhood Sanctuary',
        countyRegion: 'Nairobi',
        townArea: 'Dagoretti Road / Karen',
        childrenAgeRange: 'Ages 0 – 18 (100+ Children)',
        currentNeeds: ['Pediatric Nutrition', 'School Science Kits', 'Clean Energy Upkeep'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Renowned care sanctuary combining loving home cottages, pediatric wellness, and academic support for vulnerable children.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Youth and mentors gathered around wooden learning tables',
      },
      {
        id: 'ch-8',
        name: 'New Life Home Trust — Nairobi, Nakuru, Kisumu & Nyeri',
        institutionType: 'Children’s Home',
        regionGroup: 'Nairobi',
        specialization: 'Abandoned Infant Care & Foster Gateway',
        countyRegion: 'Nairobi',
        townArea: 'Kilimani & Regional Hubs',
        childrenAgeRange: 'Infants 0 – 4 Years',
        currentNeeds: ['Infant Care Supplies', 'Nurse Support Packs', 'Baby Cots & Linen'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Multi-county sanctuary network offering emergency medical care and tender nursery care for rescued newborn babies across Kenya.',
        imageUrl: '/src/assets/images/safe_home_refuge_1794823558780.jpg',
        imageAlt: 'Quiet warm nursery and living room welcoming infants',
      },
      {
        id: 'ch-9',
        name: 'SOS Children’s Village Nairobi & Eldoret',
        institutionType: 'Children’s Home',
        regionGroup: 'Rift Valley',
        specialization: 'Family-Like Cottage Care & Youth Empowerment',
        countyRegion: 'Uasin Gishu',
        townArea: 'Eldoret & Nairobi Cottages',
        childrenAgeRange: 'Ages 1 – 18 (95+ Children)',
        currentNeeds: ['Primary Learning Packs', 'Vocational Toolkits', 'Holiday Care Hampers'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Established family-based cottage villages nurturing orphaned and vulnerable children across Nairobi, Mombasa, Eldoret, Kisumu, and Meru.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Mentors and children sharing outdoor learning activities',
      },
      {
        id: 'ch-10',
        name: 'SOS Children’s Village Mombasa',
        institutionType: 'Children’s Home',
        regionGroup: 'Coast',
        specialization: 'Coastal Family Cottages & Schooling',
        countyRegion: 'Mombasa',
        townArea: 'Mombasa North',
        childrenAgeRange: 'Ages 2 – 18 (80+ Children)',
        currentNeeds: ['Solar Fan & Study Lighting', 'School Books', 'Sports Kits'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Supporting coastal children through mother-led family cottages, neighborhood strengthening, and youth career mentorship.',
        imageUrl: '/src/assets/images/prayer_fellowship_circle_1794821886765.jpg',
        imageAlt: 'Community group seated warmly during mentorship dialogue',
      },
      {
        id: 'ch-11',
        name: 'SOS Children’s Village Kisumu',
        institutionType: 'Children’s Home',
        regionGroup: 'Nyanza',
        specialization: 'Lake-Region Children’s Sanctuary & Learning',
        countyRegion: 'Kisumu',
        townArea: 'Milimani / Kisumu',
        childrenAgeRange: 'Ages 2 – 18 (75+ Children)',
        currentNeeds: ['Mosquito Nets', 'Library Books', 'Community Food Staples'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Welcoming corporate teams, church circles, and student volunteers to support long-term child care and youth education around Lake Victoria.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Students and mentors working together at wooden desks',
      },
      {
        id: 'ch-12',
        name: 'Nyumbani Village — Kitui County',
        institutionType: 'Children’s Home',
        regionGroup: 'Eastern',
        specialization: 'Intergenerational Child & Elder Eco-Village',
        countyRegion: 'Kitui',
        townArea: 'Kwa Vonza / Kitui',
        childrenAgeRange: 'Ages 2 – 18 (400+ Children)',
        currentNeeds: ['Water Harvesting Tanks', 'Drought-Resilient Seeds', 'Secondary Textbooks'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Self-sustaining Eastern Kenya community village pairing orphaned children with caring grandparents, vocational farming, and green energy.',
        imageUrl: '/src/assets/images/impact_community_outreach_1794821887071.jpg',
        imageAlt: 'Fresh harvest baskets prepared by volunteers for community families',
      },
      {
        id: 'ch-13',
        name: 'Tumaini Sanctuary Children’s Home Nyeri',
        institutionType: 'Children’s Home',
        regionGroup: 'Central',
        specialization: 'Mt. Kenya Regional Child Care & Rescue',
        countyRegion: 'Nyeri',
        townArea: 'Nyeri Town',
        childrenAgeRange: 'Ages 4 – 17 (44 Children)',
        currentNeeds: ['Warm Woollen Blankets', 'Maize & Beans', 'Creative Arts Supplies'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Serving children across Nyeri, Kirinyaga, Murang’a, and Laikipia with warm residential care and structured weekend mentorship.',
        imageUrl: '/src/assets/images/thanksgiving_christmas_feast_1794910602331.jpg',
        imageAlt: 'Children seated together enjoying warm community meals outdoors',
      },
      {
        id: 'ch-14',
        name: 'Rehema Bukura Children’s Haven',
        institutionType: 'Children’s Home',
        regionGroup: 'Western',
        specialization: 'Western Kenya Child Shelter & Reintegration',
        countyRegion: 'Kakamega',
        townArea: 'Kakamega / Bukura',
        childrenAgeRange: 'Ages 3 – 16 (52 Children)',
        currentNeeds: ['School Shoes', 'Clean Water Filters', 'Cooking Fuel & Food'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Partner children’s haven serving Kakamega, Vihiga, Bungoma, and Busia families with safe boarding, tutoring, and family reunification.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Community helpers reading storybooks with young children',
      },
      {
        id: 'ch-15',
        name: 'Machakos Hope Rescue & Children’s Home',
        institutionType: 'Children’s Home',
        regionGroup: 'Eastern',
        specialization: 'Rescue Protection & Primary Schooling',
        countyRegion: 'Machakos',
        townArea: 'Machakos / Athi River',
        childrenAgeRange: 'Ages 4 – 17 (48 Children)',
        currentNeeds: ['Mattresses & Linen', 'Grain & Cooking Oil', 'Stationery Packs'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Working alongside County Children’s Officers across Machakos, Makueni, and Kajiado to shelter and educate vulnerable children.',
        imageUrl: '/src/assets/images/impact_community_outreach_1794821887071.jpg',
        imageAlt: 'Fresh provisions and hampers sorted by community volunteers',
      },
      {
        id: 'ch-16',
        name: 'Garissa Oasis Children’s Sanctuary',
        institutionType: 'Children’s Home',
        regionGroup: 'North Eastern',
        specialization: 'Arid-Region Child Care & Nutrition',
        countyRegion: 'Garissa',
        townArea: 'Garissa Town',
        childrenAgeRange: 'Ages 3 – 16 (36 Children)',
        currentNeeds: ['High-Protein Nutrition', 'Solar Cooling & Water', 'Exercise Books'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Community sanctuary supporting orphaned and pastoralist children across Garissa, Wajir, and Mandera with safe shelter and schooling.',
        imageUrl: '/src/assets/images/thanksgiving_christmas_feast_1794910602331.jpg',
        imageAlt: 'Community members sharing food hampers under acacia trees',
      },
      {
        id: 'ch-17',
        name: 'St. Monica Lodwar Children’s Sanctuary',
        institutionType: 'Children’s Home',
        regionGroup: 'Rift Valley',
        specialization: 'Turkana Nutrition & Girl-Child Education',
        countyRegion: 'Turkana',
        townArea: 'Lodwar',
        childrenAgeRange: 'Ages 4 – 17 (60 Children)',
        currentNeeds: ['Clean Water Storage', 'Sanitary & Dignity Packs', 'School Uniforms'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Northern Rift Valley haven providing safe boarding, nutritious meals, and secondary school pathways for girls and vulnerable youth.',
        imageUrl: '/src/assets/images/prayer_fellowship_circle_1794821886765.jpg',
        imageAlt: 'Caregivers and community visitors conversing warmly',
      },
      {
        id: 'ch-18',
        name: 'SOS Children’s Village Meru',
        institutionType: 'Children’s Home',
        regionGroup: 'Eastern',
        specialization: 'Mt. Kenya East Family Care & Learning',
        countyRegion: 'Meru',
        townArea: 'Meru Town',
        childrenAgeRange: 'Ages 2 – 18 (70 Children)',
        currentNeeds: ['Textbooks & Readers', 'Warm Jackets', 'Youth Mentorship'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Family-centered cottages serving Meru, Tharaka-Nithi, and Embu communities with educational backing and youth transitions.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Students reading alongside volunteer mentors',
      },
      // SCHOOLS FOR THE DIFFERENTLY ABLED ACROSS KENYA
      {
        id: 'sch-1',
        name: 'Jacaranda Special School',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Nairobi',
        specialization: 'Autism (ASD), Down Syndrome & Intellectual Learning',
        countyRegion: 'Nairobi',
        townArea: 'Kilimani / Kileleshwa',
        childrenAgeRange: 'Ages 4 – 19 (Day & Boarding)',
        currentNeeds: ['Sensory Play Stations', 'Visual Communication Cards', 'Occupational Therapy Mats'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Leading public special education school equipping autistic learners and students with Down syndrome or developmental delays for joyful independence.',
        imageUrl: '/src/assets/images/doc_asd_family_moment_1794832339166.jpg',
        imageAlt: 'Parent and autistic child arranging wooden sensory blocks and picture schedules',
      },
      {
        id: 'sch-2',
        name: 'Ngala School for the Deaf',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Nairobi',
        specialization: 'Deaf & Hard-of-Hearing Education',
        countyRegion: 'Nairobi',
        townArea: 'Bahati / Nairobi',
        childrenAgeRange: 'Early Years – Primary',
        currentNeeds: ['Kenyan Sign Language Books', 'Visual Learning Projectors', 'Hearing Care Batteries'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Historic Nairobi public school empowering deaf and hard-of-hearing learners through Kenyan Sign Language literacy, creative arts, and life skills.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Students learning actively with teachers around wooden tables',
      },
      {
        id: 'sch-3',
        name: 'Salvation Army Joytown Special School',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Central',
        specialization: 'Physical Disabilities, Cerebral Palsy & Spina Bifida',
        countyRegion: 'Kiambu',
        townArea: 'Thika',
        childrenAgeRange: 'Primary & Secondary Residential',
        currentNeeds: ['Custom Wheelchairs & Walkers', 'Physiotherapy Equipment', 'Accessible Desks'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Premier Kenyan primary and secondary campus combining academics, physiotherapy, orthopedic care, and vocational confidence for physically differently abled learners.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Volunteers collaborating warmly with students at a campus courtyard',
      },
      {
        id: 'sch-4',
        name: 'Salvation Army Thika School for the Blind',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Central',
        specialization: 'Visual Impairment (Blind & Low Vision)',
        countyRegion: 'Kiambu',
        townArea: 'Thika',
        childrenAgeRange: 'Primary & National High School',
        currentNeeds: ['Braille Paper & Perkins Braillers', 'Screen-Reader Laptops', 'White Mobility Canes'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Kenya’s flagship national primary and high school for visually impaired learners—excelling in Braille literacy, music, athletics, and assistive coding.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Students engaged in guided reading and technology mentoring',
      },
      {
        id: 'sch-5',
        name: 'PCEA Kambui School for the Deaf',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Central',
        specialization: 'Deaf & Hard-of-Hearing + Vocational Skills',
        countyRegion: 'Kiambu',
        townArea: 'Githunguri / Kambui',
        childrenAgeRange: 'ECD, Primary & Junior Secondary',
        currentNeeds: ['Sign-Language Flashcards', 'Tailoring & Woodwork Tools', 'Sports Uniforms'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Regional residential school celebrating deaf learners through Kenyan Sign Language mastery, drama, athletics, and practical vocational arts.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Smiling students and mentors gathered outdoors with learning supplies',
      },
      {
        id: 'sch-6',
        name: 'Salvation Army Likoni School for the Visually Impaired',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Coast',
        specialization: 'Visual Impairment & Assistive Tech Coding',
        countyRegion: 'Mombasa',
        townArea: 'Likoni',
        childrenAgeRange: 'Primary & High School',
        currentNeeds: ['Refreshable Braille Displays', 'Audio Learning Headphones', 'Orientation Canes'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Renowned coastal campus providing Braille education, screen-reader digital labs, mobility training, and independent living preparation.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Mentors guiding coastal learners at classroom study desks',
      },
      {
        id: 'sch-7',
        name: 'Mombasa Secondary School for the Physically Handicapped',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Coast',
        specialization: 'Physical & Orthopedic Accessibility Secondary Care',
        countyRegion: 'Mombasa',
        townArea: 'Nyali / Mombasa',
        childrenAgeRange: 'National Secondary Students',
        currentNeeds: ['Ramps & Dorm Accessibility Care', 'STEM Lab Equipment', 'Mobility Crutches'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Barrier-free coastal national secondary school equipping students with mobility challenges for university, technical trades, and leadership.',
        imageUrl: '/src/assets/images/prayer_fellowship_circle_1794821886765.jpg',
        imageAlt: 'Students and facilitators sharing encouragement in a courtyard circle',
      },
      {
        id: 'sch-8',
        name: 'Sahajanand Special School Mtwapa',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Coast',
        specialization: 'Multi-Disability Inclusive Special Needs Centre',
        countyRegion: 'Kilifi',
        townArea: 'Mtwapa',
        childrenAgeRange: 'Ages 5 – 18 (Multi-Unit Campus)',
        currentNeeds: ['Hearing Aids', 'Tactile Sensory Kits', 'Boarding Pantry Supplies'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Coastal centre of excellence welcoming learners with hearing, visual, physical, and developmental differences under dedicated specialist care.',
        imageUrl: '/src/assets/images/doc_asd_family_moment_1794832339166.jpg',
        imageAlt: 'Caregiver and child smiling while engaging with tactile wooden blocks',
      },
      {
        id: 'sch-9',
        name: 'St. Oda School for the Visually Impaired',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Nyanza',
        specialization: 'Blind, Low Vision & Multi-Disability Support',
        countyRegion: 'Siaya',
        townArea: 'Aluor / Gem',
        childrenAgeRange: 'Primary & Junior Secondary',
        currentNeeds: ['Braille Textbooks', 'Solar Classroom Lighting', 'Digital Audio Recorders'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Historic Western-Nyanza boarding campus dedicated to visual-impairment excellence, mobility orientation, and accessible ICT training.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Learners seated warmly with mentors during study hours',
      },
      {
        id: 'sch-10',
        name: 'Mumias Primary & St. Angela Secondary Schools for the Deaf',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Western',
        specialization: 'Deaf Learners & Vocational Empowerment',
        countyRegion: 'Kakamega',
        townArea: 'Mumias',
        childrenAgeRange: 'Primary & Girls Secondary / Vocational',
        currentNeeds: ['Sign-Language Dictionaries', 'Vocational Sewing Machines', 'Boarding Meals'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Sister primary and national girls secondary campuses empowering deaf learners across Western Kenya through academic and vocational mastery.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Students reading storybooks alongside community visitors',
      },
      {
        id: 'sch-11',
        name: 'Kapsabet School for the Deaf',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Rift Valley',
        specialization: 'Hearing Impairment & Vocational Skills',
        countyRegion: 'Nandi',
        townArea: 'Kapsabet',
        childrenAgeRange: 'Primary & Vocational Wing',
        currentNeeds: ['Interactive Smartboards', 'Carpentry Kits', 'Warm School Sweaters'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Serving learners across Nandi, Uasin Gishu, and the wider North Rift with deaf-friendly instruction and hands-on skills training.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Youth mentored in small learning circles around tables',
      },
      {
        id: 'sch-12',
        name: 'Kuja Special Secondary School for the Deaf',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Nyanza',
        specialization: 'Secondary Education for Deaf Youth',
        countyRegion: 'Migori',
        townArea: 'Rongo / Kuja',
        childrenAgeRange: 'Secondary Youth',
        currentNeeds: ['Science Lab Visual Kits', 'Textbooks', 'Sports Footwear'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Regional secondary sanctuary helping deaf teenagers achieve KCSE qualifications, arts confidence, and career mentorship.',
        imageUrl: '/src/assets/images/prayer_fellowship_circle_1794821886765.jpg',
        imageAlt: 'Students and teachers gathered together in supportive dialogue',
      },
      {
        id: 'sch-13',
        name: 'Joyland Special School Kisumu',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Nyanza',
        specialization: 'Physical Disabilities & Inclusive Rehabilitation',
        countyRegion: 'Kisumu',
        townArea: 'Kisumu Town',
        childrenAgeRange: 'Primary & Inclusive Special Units',
        currentNeeds: ['Standing Frames', 'Physiotherapy Cushions', 'Accessible Sanitation'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Nyanza residential school supporting physically differently abled children alongside inclusive cerebral palsy therapy and recreation.',
        imageUrl: '/src/assets/images/doc_asd_family_moment_1794832339166.jpg',
        imageAlt: 'Caregiver and child playing with tactile learning toys',
      },
      {
        id: 'sch-14',
        name: 'St. Lucy School for the Blind Igoji',
        institutionType: 'School for Differently Abled',
        regionGroup: 'Eastern',
        specialization: 'Visual Impairment & Braille Literacy',
        countyRegion: 'Meru',
        townArea: 'Igoji / Meru',
        childrenAgeRange: 'Primary & Integrated Secondary',
        currentNeeds: ['Braille Embossers', 'Audio Textbooks', 'Warm Bedding'],
        acceptsCorporateTeams: true,
        acceptsIndividualGroups: true,
        description:
          'Mt. Kenya East residential special campus nurturing blind and low-vision students with Braille literacy, music, and digital tools.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Mentors and students collaborating at study tables',
      },
    ],
    rehabFacilities: [
      {
        id: 'reh-1',
        name: 'Serene Horizon Restoration Centre',
        focusType: 'Substance & Addiction Recovery',
        careFormat: 'Residential & Outpatient',
        countyRegion: 'Nairobi',
        townArea: 'Karen / Ngong Road',
        lat: -1.3192,
        lng: 36.7073,
        acceptsCommunityReferrals: true,
        summary:
          'Dignified medical detox supervision, evidence-based addiction counselling, and family reconciliation workshops in a quiet garden campus.',
        imageUrl: '/src/assets/images/doc_rehab_recovery_garden_1794832339842.jpg',
        imageAlt: 'Sunlit stone garden pathway and timber chairs at a peaceful rehabilitation centre',
      },
      {
        id: 'reh-2',
        name: 'Maji Mazuri Youth & Family Recovery Hub',
        focusType: 'Youth & Adolescent Restoration',
        careFormat: 'Outpatient Counselling',
        countyRegion: 'Kiambu',
        townArea: 'Kikuyu / Limuru',
        lat: -1.2465,
        lng: 36.6634,
        acceptsCommunityReferrals: true,
        summary:
          'Dedicated youth behavioural rehabilitation, digital & substance recovery, parent coaching, and vocational reintegration close to home.',
        imageUrl: '/src/assets/images/counselling_safe_space_1794823558841.jpg',
        imageAlt: 'Warm counselling room with soft daylight and wooden armchairs',
      },
      {
        id: 'reh-3',
        name: 'Rift Valley Renewal & Trauma Sanctuary',
        focusType: 'Trauma & Crisis Rehabilitation',
        careFormat: 'Residential & Outpatient',
        countyRegion: 'Nakuru',
        townArea: 'Nakuru Town',
        lat: -0.3031,
        lng: 36.08,
        acceptsCommunityReferrals: true,
        summary:
          'Trauma-informed inpatient and day-program care supporting survivors of acute crisis, grief, burnout, and emotional dependency.',
        imageUrl: '/src/assets/images/safe_home_refuge_1794823558780.jpg',
        imageAlt: 'Peaceful residential lounge offering calm refuge and supportive care',
      },
      {
        id: 'reh-4',
        name: 'Lakeside Wholeness & Family Care Clinic',
        focusType: 'Family & Holistic Care',
        careFormat: 'Outpatient Counselling',
        countyRegion: 'Kisumu',
        townArea: 'Milimani / Kisumu',
        lat: -0.0917,
        lng: 34.768,
        acceptsCommunityReferrals: true,
        summary:
          'Accessible outpatient family rehabilitation, dual-diagnosis counselling, and weekly community recovery support circles around the lake region.',
        imageUrl: '/src/assets/images/doc_rehab_recovery_garden_1794832339842.jpg',
        imageAlt: 'Tranquil courtyard garden at a community family restoration clinic',
      },
      {
        id: 'reh-5',
        name: 'Pwani New Dawn Recovery Wing',
        focusType: 'Substance & Addiction Recovery',
        careFormat: 'Detox & Medical Recovery',
        countyRegion: 'Mombasa',
        townArea: 'Nyali / Mombasa',
        lat: -4.0435,
        lng: 39.6682,
        acceptsCommunityReferrals: true,
        summary:
          'Coastal medical stabilisation, compassionate family therapy, and structured sober-living reintegration pathways.',
        imageUrl: '/src/assets/images/counselling_safe_space_1794823558841.jpg',
        imageAlt: 'Bright indoor therapy room welcoming families seeking recovery care',
      },
    ],
    asdGuides: [
      {
        id: 'asd-1',
        pillar: 'Sensory-Friendly Home',
        title: 'Creating a Calm Sensory Corner at Home',
        audienceTag: 'Parents & Kids · Easy Daily Setup',
        summary:
          'Autistic children often experience lights, loud echoes, and clutter more intensely. A predictable low-stimulation corner helps their nervous system reset gently.',
        practicalSteps: [
          'Choose a quiet corner with soft natural light or warm lamp lighting instead of harsh overhead bulbs.',
          'Keep a familiar basket of comforting textures (weighted blanket, soft cushion, fidget toy, or noise-cancelling ear defenders).',
          'Never use the calm corner as punishment—introduce it when your child is happy so it feels like a safe harbour.',
        ],
      },
      {
        id: 'asd-2',
        pillar: 'Calm Overwhelm & Meltdowns',
        title: 'Understanding Meltdowns vs. Tantrums With Love',
        audienceTag: 'Parents & Caregivers · Crisis Moments',
        summary:
          'A meltdown is sensory or emotional overload—not bad behaviour. Lowering demands and staying calm helps your child feel safe faster.',
        practicalSteps: [
          'Speak softly using short, calm sentences (or pause talking altogether while ensuring physical safety).',
          'Reduce triggers right away: dim bright lights, turn off loud TVs, and give breathing space without lecturing.',
          'Wait until after your child is fully settled to reconnect with water, a hug (if welcomed), or a gentle visual check-in.',
        ],
      },
      {
        id: 'asd-3',
        pillar: 'Visual Routines & Speech',
        title: 'Using Picture Schedules & Gentle Transitions',
        audienceTag: 'Daily Living · Communication',
        summary:
          'Knowing what happens next reduces anxiety. Simple visual cards and 5-minute countdown warnings make mornings, meals, and bedtime smoother.',
        practicalSteps: [
          'Place 4–5 simple picture or drawn cards in order for key routines (Wake Up → Brush Teeth → Breakfast → School).',
          'Give clear countdown warnings before stopping play (“5 more minutes with blocks, then bath time”).',
          'Celebrate all communication—speech, pointing, picture exchange, gestures, or typing are all valid voices.',
        ],
      },
      {
        id: 'asd-4',
        pillar: 'Siblings, School & Faith',
        title: 'Helping Siblings, Relatives & Communities Understand',
        audienceTag: 'Family & Community Inclusion',
        summary:
          'Extended family and community spaces thrive when people learn patience, clear sensory kindness, and joy in every child’s unique strengths.',
        practicalSteps: [
          'Explain autism to siblings simply: “Their brain notices sounds and feelings extra strongly, so quiet kindness helps them shine.”',
          'Share a short one-page “How I Like to Be Greeted” note with teachers, Sunday caregivers, and relatives.',
          'Build around your child’s special interests (trains, music, drawing, patterns)—they are wonderful bridges to joy and learning.',
        ],
      },
    ],
    impactProjects: [
      {
        id: 'imp-1',
        slug: 'childrens-home-partnership-and-csr-day',
        title: 'Children’s Home Mentorship & Care Hamper Day',
        category: 'Community Outreach',
        dateLabel: 'October 2025',
        locationLabel: 'Partner Children’s Home Courtyard',
        summary:
          'Corporate volunteers and community friends partnered together to spend a joyful day reading, playing, and equipping a partner children’s home.',
        whatWasDone:
          'HIS AND HERS coordinated a vetted corporate CSR team and local storytellers to bring reading books, school packs, fresh produce, and unhurried mentorship games to a partner children’s home.',
        whyItMattered:
          'Children thrive on genuine presence and long-term care, not drop-off charity. Structured visits ensure safeguarding, warmth, and real friendship.',
        whoItServed:
          '42 children aged 3–16 alongside house mothers and dedicated residential caregivers.',
        whatGlowHopedToAchieve:
          'To connect caring organisations and everyday individuals directly with verified children’s homes.',
        documentedStory:
          'Under wide courtyard trees, teams read stories side by side, shared fruit and lunch, and pledged ongoing termly stationery support.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Corporate volunteers and community members reading with children at a partner children home',
        featured: true,
        createdAt: '2025-10-18T10:00:00.000Z',
      },
      {
        id: 'imp-2',
        slug: 'youth-encouragement-and-mentorship-circles',
        title: 'Youth Encouragement & Mental Wellbeing Circles',
        category: 'Community Engagement',
        dateLabel: 'March 2025',
        locationLabel: 'Community Learning Hall',
        summary:
          'Intergenerational mentorship and listening tables creating safe spaces for young people to speak openly, receive guidance, and lighten emotional burdens.',
        whatWasDone:
          'We hosted welcoming afternoon sessions pairing trained community mentors, counsellors, and educators with youth for open dialogue and emotional wellbeing conversations.',
        whyItMattered:
          'Many young people carry quiet pressures around mental health, family stress, and belonging. Having trusted adults who listen breaks isolation.',
        whoItServed:
          'Teenagers, students, and young adults from across diverse neighbourhoods.',
        whatGlowHopedToAchieve:
          'To cultivate a supportive environment where young people feel heard, safe, and connected to caring mentors and counsellors.',
        documentedStory:
          'Seated around long wooden tables with notebooks and tea, mentors and students reflected on emotional resilience, hope, and community care.',
        imageUrl: '/src/assets/images/impact_education_youth_1794821888567.jpg',
        imageAlt: 'Community mentors and youth seated together around wooden tables in warm conversation',
        featured: true,
        createdAt: '2025-03-14T10:00:00.000Z',
      },
      {
        id: 'imp-3',
        slug: 'asd-parent-and-family-compassion-workshop',
        title: 'ASD Parents & Caregivers Support Gathering',
        category: 'Acts of Compassion',
        dateLabel: 'August 2025',
        locationLabel: 'HIS AND HERS Care Family Hub',
        summary:
          'A sensory-friendly afternoon empowering parents of autistic children with visual routine tools, calm regulation tips, and peer solidarity.',
        whatWasDone:
          'Occupational therapists, parents, and community volunteers co-hosted an interactive sensory toolkit workshop while caring warmly for children in a calm adjoining playroom.',
        whyItMattered:
          'Raising a neurodivergent child can feel isolating without practical community understanding. Sharing real tools restores confidence and joy.',
        whoItServed:
          'Parents, guardians, siblings, and children on the autism spectrum.',
        whatGlowHopedToAchieve:
          'To build a warm, stigma-free community where ASD families feel celebrated and supported.',
        documentedStory:
          'Parents crafted custom picture schedules over tea while children explored wooden sensory puzzles in a gentle daylight room.',
        imageUrl: '/src/assets/images/doc_asd_family_moment_1794832339166.jpg',
        imageAlt: 'Parent and young autistic child playing calmly with colorful wooden blocks and picture cards',
        featured: true,
        createdAt: '2025-08-22T10:00:00.000Z',
      },
      {
        id: 'imp-4',
        slug: 'sanctuary-doors-open-night-of-refuge',
        title: 'Safe Refuge & Rehabilitation Pathways Evening',
        category: 'Support for Vulnerable Communities',
        dateLabel: 'February 2026',
        locationLabel: 'HIS AND HERS Care Family Sanctuary',
        summary:
          'An open-door evening combining gentle worship, confidential counselling, rehabilitation referrals, and safe-refuge guidance.',
        whatWasDone:
          'We opened our gathering space for a calm evening featuring acoustic reflection, one-on-one counselling check-ins, and guided referrals to partner rehab and shelter facilities.',
        whyItMattered:
          'Families battling trauma, addiction, or domestic danger need trustworthy bridges to nearby care facilities without shame.',
        whoItServed:
          'Individuals, families seeking rehabilitation partners, and survivors rebuilding stability.',
        whatGlowHopedToAchieve:
          'To bridge spiritual care, mental health listening, and practical safeguarding under one welcoming roof.',
        documentedStory:
          'As evening settled over the sanctuary, attendees connected with counsellors, rehab liaisons, and prayer companions in warmth and dignity.',
        imageUrl: '/src/assets/images/doc_rehab_recovery_garden_1794832339842.jpg',
        imageAlt: 'Sunlit restoration centre garden where counsellor and family member sit together',
        featured: false,
        createdAt: '2026-02-09T10:00:00.000Z',
      },
    ],
    events: [
      {
        id: 'evt-nov28',
        slug: 'november-28-thanksgiving-feast-and-early-christmas-relief',
        title: 'November 28 Thanksgiving Feast & Early Christmas Relief Initiative',
        category: 'Community Outreach',
        dateISO: '2026-11-28',
        timeLabel: '10:00 – 16:00',
        venue: '47-County Community Tables & Karen Hub Courtyard',
        summary:
          'A joyful Thanksgiving Feast and Early Christmas outreach feeding families across communities and gifting small bundles of relief tokens to cushion hard economic times.',
        description:
          'On 28 November, HIS AND HERS hosts warm outdoor thanksgiving tables stocked with freshly prepared community meals alongside practical relief token bundles (essential grain staples, soap, school notebooks, and direct family vouchers) designed with dignity to cushion households heading into the festive season.',
        registrationOpen: true,
        registrationNote:
          'Everyone is welcome to dine, volunteer, or sponsor relief token bundles for families across all 47 counties.',
        imageUrl: '/src/assets/images/thanksgiving_christmas_feast_1794910602331.jpg',
        imageAlt: 'Families and children seated joyfully at a sunlit community Thanksgiving feast beside neatly tied relief bundles',
        featured: true,
        createdAt: now,
      },
      {
        id: 'evt-1',
        slug: 'corporate-and-community-childrens-home-visit-day',
        title: 'Partner Children’s Home Visit & Mentorship Day',
        category: 'Children’s Home Visits',
        dateISO: '2026-12-02',
        timeLabel: '09:30 – 14:30',
        venue: 'Amani Gardens & Partner Homes (47-County Network)',
        summary:
          'Corporate CSR teams, friend groups, and individual volunteers join guided storytelling, youth mentorship, and care pack deliveries at verified children’s homes.',
        description:
          'Pre-briefed visitor teams meet our safeguarding coordinators at 09:30 for arrival orientation before spending a structured, joyful day reading beneath courtyard trees, playing group games, and delivering requested school and nutrition supplies.',
        registrationOpen: true,
        registrationNote:
          'Individual helpers welcome; corporate & school teams can also book custom dates via Children’s Homes.',
        imageUrl: '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
        imageAlt: 'Volunteers and children celebrating reading and care hampers at a children home',
        featured: true,
        createdAt: now,
      },
      {
        id: 'evt-2',
        slug: 'asd-parents-and-kids-sensory-play-morning',
        title: 'ASD Parents Coffee & Sensory-Friendly Kids Morning',
        category: 'ASD Family Gatherings',
        dateISO: '2026-12-05',
        timeLabel: '10:00 – 12:30',
        venue: 'HIS AND HERS Care Family Hub (Quiet Garden Room)',
        summary:
          'A calm, welcoming morning for parents raising children on the autism spectrum—featuring visual routine swaps, practical home tips, and gentle sensory play.',
        description:
          'No shushing, no judgement. Parents connect over tea with occupational therapy mentors and fellow caregivers while children enjoy soft lighting, wooden sensory stations, and quiet corner activities.',
        registrationOpen: true,
        registrationNote: 'Free community entry; let us know your child’s sensory preferences when registering.',
        imageUrl: '/src/assets/images/doc_asd_family_moment_1794832339166.jpg',
        imageAlt: 'Parent and young child exploring sensory blocks and routine cards',
        featured: true,
        createdAt: now,
      },
      {
        id: 'evt-3',
        slug: 'mental-health-listening-and-burden-sharing-circle',
        title: 'Lighten Your Burden: Mental Health & Recovery Circle',
        category: 'Mental Health & Recovery',
        dateISO: '2026-12-10',
        timeLabel: '18:00 – 19:30',
        venue: 'HIS AND HERS Care & Listening Space',
        summary:
          'A stigma-free community evening offering mental wellbeing encouragement, counsellor Q&A, nearby rehabilitation centre guidance, and confidential listening.',
        description:
          'Hosted alongside volunteer counsellors and partner rehabilitation liaisons, this small-group circle offers a quiet room to breathe, lighten heavy burdens, and explore nearby recovery pathways without pressure.',
        registrationOpen: true,
        registrationNote: 'Confidentiality and mutual respect are upheld by everyone attending.',
        imageUrl: '/src/assets/images/counselling_safe_space_1794823558841.jpg',
        imageAlt: 'Warm sunlit counselling and listening room with armchairs and plants',
        featured: true,
        createdAt: now,
      },
      {
        id: 'evt-4',
        slug: 'neighbour-to-neighbour-helping-hand-and-pantry-day',
        title: 'Neighbour-to-Neighbour Helping Hand & Fresh Pantry Drive',
        category: 'Community Outreach',
        dateISO: '2026-12-14',
        timeLabel: '09:00 – 13:30',
        venue: 'Karen & Lang’ata Community Courtyard',
        summary:
          'Hands-on community action assembling fresh produce baskets, hygiene kits, and warmth packages for vulnerable households and elder neighbours.',
        description:
          'Volunteers of all ages pack nutritious food hampers, sort warm clothing, and accompany community elders and single-parent families with dignity and warm fellowship.',
        registrationOpen: true,
        registrationNote: 'Bring comfortable walking shoes; pantry donations and sorting hands are both welcome.',
        imageUrl: '/src/assets/images/impact_community_outreach_1794821887071.jpg',
        imageAlt: 'Community volunteers sharing fresh produce hampers outdoors with neighbours',
        featured: true,
        createdAt: now,
      },
      {
        id: 'evt-5',
        slug: 'safe-refuge-awareness-and-family-peace-evening',
        title: 'Safe Homes, Family Peace & Prayer Evening',
        category: 'Safe Refuge & Fellowship',
        dateISO: '2026-12-19',
        timeLabel: '16:30 – 19:00',
        venue: 'HIS AND HERS Care Family Sanctuary',
        summary:
          'An open, compassionate evening uniting safeguarding advocates, interdenominational prayer, and practical help for families building safe homes free from abuse.',
        description:
          'Join neighbours, safeguarding volunteers, and faith companions for gentle worship, community safeguarding awareness, and private one-on-one support stations.',
        registrationOpen: true,
        registrationNote: 'Open to individuals, families, and community partner teams.',
        imageUrl: '/src/assets/images/doc_worship_gathering_1794832340911.jpg',
        imageAlt: 'Community gathered together in warmth, hope, and fellowship',
        featured: false,
        createdAt: now,
      },
    ],
    villageContributions: [
      {
        id: 'vc-1',
        contributorName: 'Karanja & Family',
        region: 'Nairobi',
        tierId: 'books',
        tierLabel: 'Reading & Stationery Pack',
        units: 4,
        amountKes: 6000,
        encouragementNote: 'May every child at Amani Gardens love afternoon reading circles.',
        createdAt: '2025-11-12T09:15:00.000Z',
      },
      {
        id: 'vc-2',
        contributorName: 'Mwangaza Wellness Group',
        region: 'Kiambu',
        tierId: 'sensory',
        tierLabel: 'ASD Sensory Calm Kit',
        units: 3,
        amountKes: 10500,
        encouragementNote: 'Standing beside autistic children and their dedicated parents.',
        createdAt: '2026-01-19T14:20:00.000Z',
      },
      {
        id: 'vc-3',
        contributorName: 'Pwani Friends Circle',
        region: 'Mombasa',
        tierId: 'pantry',
        tierLabel: 'Warm Family Pantry Basket',
        units: 5,
        amountKes: 12500,
        encouragementNote: 'Fresh food baskets for coastal households rebuilding peace.',
        createdAt: '2026-03-04T11:30:00.000Z',
      },
      {
        id: 'vc-4',
        contributorName: 'Hope Bridge Partners',
        region: 'Nakuru',
        tierId: 'counselling',
        tierLabel: 'Counselling & Burden-Share Hour',
        units: 4,
        amountKes: 16000,
        encouragementNote: 'Sponsored listening sessions and family rehab guidance in Rift Valley.',
        createdAt: '2026-05-10T16:45:00.000Z',
      },
      {
        id: 'vc-5',
        contributorName: 'Amani Safeguard Allies',
        region: 'Kisumu',
        tierId: 'refuge',
        tierLabel: 'Safe Refuge Emergency Night',
        units: 2,
        amountKes: 19000,
        encouragementNote: 'Safe shelter and protection when women and children need it most.',
        createdAt: '2026-08-21T08:10:00.000Z',
      },
    ],
    prayerRequests: [],
    counsellingRequests: [],
    safeHomeRequests: [],
    homeVisitBookings: [],
    partnerOrganizations: [],
    rehabReferrals: [],
    asdSupportRequests: [],
    volunteerEnquiries: [],
    contactMessages: [],
    eventRegistrations: [],
    emergencyAlerts: [],
  };
}

const LEGACY_IMAGE_UPGRADES: Record<string, string> = {
  '/src/assets/images/children_home_visit_joy_1794828208960.jpg':
    '/src/assets/images/doc_childrens_home_csr_1794832339445.jpg',
  '/src/assets/images/asd_parent_child_care_1794828209127.jpg':
    '/src/assets/images/doc_asd_family_moment_1794832339166.jpg',
  '/src/assets/images/rehab_recovery_garden_1794828209576.jpg':
    '/src/assets/images/doc_rehab_recovery_garden_1794832339842.jpg',
  '/src/assets/images/worship_gathering_sanctuary_1794821887938.jpg':
    '/src/assets/images/doc_worship_gathering_1794832340911.jpg',
};

function upgradeImageUrl(url: string): { nextUrl: string; changed: boolean } {
  const mapped = LEGACY_IMAGE_UPGRADES[url];
  if (mapped) {
    return { nextUrl: mapped, changed: true };
  }
  return { nextUrl: url, changed: false };
}

function ensureDatabaseExists(): AppDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AppDatabase>;
    const seed = createSeedDatabase();
    let migrated = false;

    const migrateList = <T extends { imageUrl: string }>(items: T[]): T[] =>
      items.map((item) => {
        const { nextUrl, changed } = upgradeImageUrl(item.imageUrl);
        if (changed) migrated = true;
        return changed ? { ...item, imageUrl: nextUrl } : item;
      });

    const seedEventsById = new Map(seed.events.map((e) => [e.id, e]));
    let migratedEvents = migrateList(parsed.events?.length ? parsed.events : seed.events).map((evt) => {
      const seedMatch = seedEventsById.get(evt.id);
      if (
        seedMatch &&
        (evt.slug === 'corporate-and-community-childrens-home-visit-day' ||
          evt.slug === 'asd-parents-and-kids-sensory-play-morning' ||
          evt.slug === 'mental-health-listening-and-burden-sharing-circle' ||
          evt.slug === 'interdenominational-evening-of-worship-and-intercession')
      ) {
        if (evt.category !== seedMatch.category || evt.slug === 'interdenominational-evening-of-worship-and-intercession') {
          migrated = true;
          if (evt.id === 'evt-4') {
            return { ...seedMatch, createdAt: evt.createdAt || seedMatch.createdAt };
          }
          return {
            ...evt,
            category: seedMatch.category,
          };
        }
      }
      const normalized = normalizeEventCategory(evt.category);
      if (normalized !== evt.category) {
        migrated = true;
        return { ...evt, category: normalized };
      }
      return evt;
    });

    if (!migratedEvents.some((e) => e.id === 'evt-5') && !migratedEvents.some((e) => e.category === 'Safe Refuge & Fellowship')) {
      migratedEvents = [...migratedEvents, seed.events[4]];
      migrated = true;
    }

    const existingHomes = migrateList(
      parsed.childrensHomes?.length ? parsed.childrensHomes : seed.childrensHomes
    ).map((h) => {
      const seedMatch = seed.childrensHomes.find((s) => s.id === h.id);
      let next = h;
      if (next.name.includes('(Partner Slot)')) {
        migrated = true;
        next = { ...next, name: next.name.replace(' (Partner Slot)', '').trim() };
      }
      if (seedMatch && (!next.institutionType || !next.regionGroup || !next.specialization)) {
        migrated = true;
        next = {
          ...next,
          institutionType: seedMatch.institutionType,
          regionGroup: seedMatch.regionGroup,
          specialization: seedMatch.specialization,
        };
      }
      return next;
    });

    const missingSeededHomes = seed.childrensHomes.filter(
      (s) => !existingHomes.some((existing) => existing.id === s.id)
    );
    if (missingSeededHomes.length > 0) {
      migrated = true;
    }
    const migratedHomes = [...existingHomes, ...missingSeededHomes];

    const migratedRehab = migrateList(
      parsed.rehabFacilities?.length ? parsed.rehabFacilities : seed.rehabFacilities
    ).map((f) => {
      if (f.name.includes('(Partner Facility)')) {
        migrated = true;
        return { ...f, name: f.name.replace(' (Partner Facility)', '').trim() };
      }
      return f;
    });

    let migratedSettings = { ...seed.settings, ...(parsed.settings || {}) };
    if (migratedSettings.primaryLocationLabel?.includes('(Editable in Admin CMS)')) {
      migratedSettings.primaryLocationLabel = seed.settings.primaryLocationLabel;
      migrated = true;
    }
    if (migratedSettings.primaryAddress?.includes('Update exact street address in Admin CMS')) {
      migratedSettings.primaryAddress = seed.settings.primaryAddress;
      migrated = true;
    }

    const migratedImpact = migrateList(
      parsed.impactProjects?.length ? parsed.impactProjects : seed.impactProjects
    ).map((proj) => {
      if (proj.id === 'imp-1' && (proj.dateLabel.includes('2024') || proj.createdAt.startsWith('2024'))) {
        migrated = true;
        return {
          ...proj,
          dateLabel: 'October 2025',
          createdAt: '2025-10-18T10:00:00.000Z',
        };
      }
      return proj;
    });

    if (!migratedEvents.some((e) => e.id === 'evt-nov28' || e.slug === 'november-28-thanksgiving-feast-and-early-christmas-relief')) {
      migratedEvents = [seed.events[0], ...migratedEvents];
      migrated = true;
    }

    let migratedAnnouncements = (parsed.announcements?.length ? parsed.announcements : seed.announcements).map((a) => {
      if (a.id === 'ann-1' && a.message.includes('GBV Safety')) {
        migrated = true;
        return seed.announcements[1];
      }
      return a;
    });
    if (!migratedAnnouncements.some((a) => a.id === 'ann-nov28')) {
      migratedAnnouncements = [seed.announcements[0], ...migratedAnnouncements];
      migrated = true;
    }

    const migratedContributions =
      Array.isArray(parsed.villageContributions) && parsed.villageContributions.length > 0
        ? parsed.villageContributions
        : seed.villageContributions;
    if (!parsed.villageContributions || parsed.villageContributions.length === 0) {
      migrated = true;
    }

    const db: AppDatabase = {
      ...seed,
      ...parsed,
      settings: migratedSettings,
      announcements: migratedAnnouncements,
      impactProjects: migratedImpact,
      events: migratedEvents,
      childrensHomes: migratedHomes,
      rehabFacilities: migratedRehab,
      asdGuides: parsed.asdGuides?.length ? parsed.asdGuides : seed.asdGuides,
      villageContributions: migratedContributions,
      counsellingRequests: parsed.counsellingRequests || [],
      safeHomeRequests: parsed.safeHomeRequests || [],
      homeVisitBookings: parsed.homeVisitBookings || [],
      partnerOrganizations: parsed.partnerOrganizations || [],
      rehabReferrals: parsed.rehabReferrals || [],
      asdSupportRequests: parsed.asdSupportRequests || [],
      emergencyAlerts: parsed.emergencyAlerts || [],
    };

    if (migrated) {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
    }

    return db;
  } catch {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

export function readDatabase(): AppDatabase {
  return ensureDatabaseExists();
}

export function writeDatabase(db: AppDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

export function getPublicSiteData(): PublicSiteData {
  const db = readDatabase();
  return {
    settings: db.settings,
    announcements: db.announcements.filter((a) => a.isActive),
    impactProjects: db.impactProjects,
    events: [...db.events].sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    childrensHomes: db.childrensHomes,
    rehabFacilities: db.rehabFacilities,
    asdGuides: db.asdGuides,
    villageContributions: db.villageContributions,
  };
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
