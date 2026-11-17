export interface KenyaCountyInfo {
  code: string;
  name: string;
  region:
    | 'Nairobi'
    | 'Central'
    | 'Coast'
    | 'Eastern'
    | 'North Eastern'
    | 'Nyanza'
    | 'Rift Valley'
    | 'Western';
  capitalTown: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  emergencyPolice: string;
  childProtectionDesk: string;
  gbvDesk: string;
  partnerProgrammes: string;
}

export const KENYA_REGION_NAMES: KenyaCountyInfo['region'][] = [
  'Nairobi',
  'Central',
  'Rift Valley',
  'Coast',
  'Eastern',
  'Nyanza',
  'Western',
  'North Eastern',
];

export const ALL_KENYA_COUNTIES: KenyaCountyInfo[] = [
  { code: '001', name: 'Mombasa', region: 'Coast', capitalTown: 'Mombasa', lat: -4.0435, lng: 39.6682, mapX: 312, mapY: 304, emergencyPolice: '999 / Mombasa Central OCS', childProtectionDesk: '116 / Mombasa County Children Office', gbvDesk: '1195 / Coast General PRC Unit', partnerProgrammes: 'Pwani Light Children’s Home, Coastal Detox & Recovery Wing, Nov 28 Relief Bundles' },
  { code: '002', name: 'Kwale', region: 'Coast', capitalTown: 'Kwale', lat: -4.1816, lng: 39.4606, mapX: 292, mapY: 320, emergencyPolice: '999 / Kwale County Command', childProtectionDesk: '116 / Kwale Child Protection Unit', gbvDesk: '1195 / Msambweni Hospital GBV Desk', partnerProgrammes: 'Coastal Safe Refuge Liaison, School Books & Family Pantry Kits' },
  { code: '003', name: 'Kilifi', region: 'Coast', capitalTown: 'Kilifi', lat: -3.6305, lng: 39.8499, mapX: 324, mapY: 280, emergencyPolice: '999 / Kilifi Police Station', childProtectionDesk: '116 / Kilifi Sub-County Children Officer', gbvDesk: '1195 / Kilifi Referral Gender Desk', partnerProgrammes: 'Youth Recovery Mentorship, Children’s Home Partnerships, Relief Tokens' },
  { code: '004', name: 'Tana River', region: 'Coast', capitalTown: 'Hola', lat: -1.4998, lng: 40.0334, mapX: 322, mapY: 205, emergencyPolice: '999 / Hola County Police', childProtectionDesk: '116 / Hola Children Protection Desk', gbvDesk: '1195 / Hola Referral Safe Desk', partnerProgrammes: 'Mobile Pantry & Harvest Cushion, Maternal & Child Safe Relocation' },
  { code: '005', name: 'Lamu', region: 'Coast', capitalTown: 'Lamu', lat: -2.2717, lng: 40.902, mapX: 356, mapY: 235, emergencyPolice: '999 / Lamu Police Division', childProtectionDesk: '116 / Lamu Children Services', gbvDesk: '1195 / King Fahd Hospital Gender Unit', partnerProgrammes: 'Island Youth Listening Circle, Emergency Shelter Coordination' },
  { code: '006', name: 'Taita-Taveta', region: 'Coast', capitalTown: 'Voi', lat: -3.3961, lng: 38.5561, mapX: 266, mapY: 290, emergencyPolice: '999 / Voi Police Command', childProtectionDesk: '116 / Taita Child Protection Desk', gbvDesk: '1195 / Moi Referral Voi GBV Unit', partnerProgrammes: 'Highway Family Safety Relay, Children’s Home Reading Packs' },
  { code: '007', name: 'Garissa', region: 'North Eastern', capitalTown: 'Garissa', lat: -0.4532, lng: 39.6461, mapX: 315, mapY: 162, emergencyPolice: '999 / Garissa County Police', childProtectionDesk: '116 / Garissa Children Protection Office', gbvDesk: '1195 / Garissa Referral Safe Desk', partnerProgrammes: 'Drought & Hardship Relief Bundles, Safe Refuge Coordination' },
  { code: '008', name: 'Wajir', region: 'North Eastern', capitalTown: 'Wajir', lat: 1.7471, lng: 40.0573, mapX: 326, mapY: 96, emergencyPolice: '999 / Wajir Police Command', childProtectionDesk: '116 / Wajir Children Desk', gbvDesk: '1195 / Wajir Referral Gender Support', partnerProgrammes: 'Community Food Cushion & Children’s Home Support Relay' },
  { code: '009', name: 'Mandera', region: 'North Eastern', capitalTown: 'Mandera', lat: 3.9366, lng: 41.867, mapX: 374, mapY: 42, emergencyPolice: '999 / Mandera County Command', childProtectionDesk: '116 / Mandera Child Protection', gbvDesk: '1195 / Mandera Referral Protection Unit', partnerProgrammes: 'Mobile Relief Token Distribution, Counsellor Phone Bridge' },
  { code: '010', name: 'Marsabit', region: 'Eastern', capitalTown: 'Marsabit', lat: 2.3284, lng: 37.9899, mapX: 248, mapY: 78, emergencyPolice: '999 / Marsabit Police Command', childProtectionDesk: '116 / Marsabit Children Office', gbvDesk: '1195 / Marsabit County Referral GBV Desk', partnerProgrammes: 'Northern Safe Shelter Referral, ASD Parent Remote Support' },
  { code: '011', name: 'Isiolo', region: 'Eastern', capitalTown: 'Isiolo', lat: 0.3556, lng: 37.5833, mapX: 238, mapY: 140, emergencyPolice: '999 / Isiolo Police Division', childProtectionDesk: '116 / Isiolo Children Officer', gbvDesk: '1195 / Isiolo Referral Safe Space', partnerProgrammes: 'Pastoralist Family Counselling, Children’s Home Partner Visits' },
  { code: '012', name: 'Meru', region: 'Eastern', capitalTown: 'Meru', lat: 0.0463, lng: 37.6559, mapX: 245, mapY: 158, emergencyPolice: '999 / Meru Police Command', childProtectionDesk: '116 / Meru Children Services', gbvDesk: '1195 / Meru Level 5 PRC Unit', partnerProgrammes: 'Rehabilitation Liaison Circles, ASD Parent Guides, CSR Visits' },
  { code: '013', name: 'Tharaka-Nithi', region: 'Eastern', capitalTown: 'Chuka', lat: -0.3333, lng: 37.65, mapX: 246, mapY: 174, emergencyPolice: '999 / Chuka Police Station', childProtectionDesk: '116 / Tharaka Child Protection Desk', gbvDesk: '1195 / Chuka Referral Protection Unit', partnerProgrammes: 'Youth Mentorship & Recovery Peer Circles, School Pack Drives' },
  { code: '014', name: 'Embu', region: 'Eastern', capitalTown: 'Embu', lat: -0.5389, lng: 37.4583, mapX: 236, mapY: 184, emergencyPolice: '999 / Embu Police Command', childProtectionDesk: '116 / Embu Child Welfare Desk', gbvDesk: '1195 / Embu Level 5 GBV Centre', partnerProgrammes: 'Partner Children’s Homes, Counsellor Burden-Share Calls' },
  { code: '015', name: 'Kitui', region: 'Eastern', capitalTown: 'Kitui', lat: -1.367, lng: 38.0106, mapX: 256, mapY: 214, emergencyPolice: '999 / Kitui Police Station', childProtectionDesk: '116 / Kitui Children Office', gbvDesk: '1195 / Kitui Referral Gender Desk', partnerProgrammes: 'Nov 28 Thanksgiving Feast Bundles, Community Safe Refuge' },
  { code: '016', name: 'Machakos', region: 'Eastern', capitalTown: 'Machakos', lat: -1.5177, lng: 37.2634, mapX: 232, mapY: 222, emergencyPolice: '999 / Machakos Police Command', childProtectionDesk: '116 / Machakos Child Protection', gbvDesk: '1195 / Machakos Level 5 PRC Desk', partnerProgrammes: 'Corporate CSR Children’s Home Days, Recovery Outpatient Care' },
  { code: '017', name: 'Makueni', region: 'Eastern', capitalTown: 'Wote', lat: -1.7808, lng: 37.6288, mapX: 246, mapY: 236, emergencyPolice: '999 / Wote Police Division', childProtectionDesk: '116 / Makueni Children Officer', gbvDesk: '1195 / Makueni County Safe Desk', partnerProgrammes: 'Household Food Cushion Drives, Child Abuse Rapid Response' },
  { code: '018', name: 'Nyandarua', region: 'Central', capitalTown: 'Ol Kalou', lat: -0.265, lng: 36.3788, mapX: 196, mapY: 170, emergencyPolice: '999 / Ol Kalou Police', childProtectionDesk: '116 / Nyandarua Children Desk', gbvDesk: '1195 / JM Kariuki Hospital Gender Unit', partnerProgrammes: 'Family Recovery Accompaniment, Harvest Meal Sharing' },
  { code: '019', name: 'Nyeri', region: 'Central', capitalTown: 'Nyeri', lat: -0.4201, lng: 36.9476, mapX: 215, mapY: 172, emergencyPolice: '999 / Nyeri Central OCS', childProtectionDesk: '116 / Nyeri Children Services', gbvDesk: '1195 / Nyeri PGH Gender Protection Unit', partnerProgrammes: 'Outpatient Substance Use Recovery, ASD Sensory Guides' },
  { code: '020', name: 'Kirinyaga', region: 'Central', capitalTown: 'Kerugoya', lat: -0.4989, lng: 37.2803, mapX: 226, mapY: 180, emergencyPolice: '999 / Kerugoya Police Command', childProtectionDesk: '116 / Kirinyaga Children Desk', gbvDesk: '1195 / Kerugoya Referral GBV Desk', partnerProgrammes: 'Children’s Home Learning Packs, Peer Family Recovery' },
  { code: '021', name: 'Murang’a', region: 'Central', capitalTown: 'Murang’a', lat: -0.7167, lng: 37.15, mapX: 220, mapY: 192, emergencyPolice: '999 / Murang’a Police Station', childProtectionDesk: '116 / Murang’a Children Protection', gbvDesk: '1195 / Murang’a Level 5 PRC Unit', partnerProgrammes: 'Highland Children’s Home Mentoring, Mental Health Listening' },
  { code: '022', name: 'Kiambu', region: 'Central', capitalTown: 'Kiambu', lat: -1.1714, lng: 36.8356, mapX: 204, mapY: 204, emergencyPolice: '999 / Kiambu & Thika Command', childProtectionDesk: '116 / Kiambu Child Welfare Desk', gbvDesk: '1195 / Kiambu & Thika Level 5 PRC', partnerProgrammes: 'Tumaini Bridge Haven, Maji Mazuri Youth Recovery, Nov 28 Feast' },
  { code: '023', name: 'Turkana', region: 'Rift Valley', capitalTown: 'Lodwar', lat: 3.1191, lng: 35.5973, mapX: 146, mapY: 54, emergencyPolice: '999 / Lodwar Police Command', childProtectionDesk: '116 / Turkana Child Protection Unit', gbvDesk: '1195 / Lodwar Referral Safe Desk', partnerProgrammes: 'Relief Food & Hygiene Bundles, Safe Shelter Relocation Relay' },
  { code: '024', name: 'West Pokot', region: 'Rift Valley', capitalTown: 'Kapenguria', lat: 1.2389, lng: 35.1119, mapX: 132, mapY: 112, emergencyPolice: '999 / Kapenguria Police', childProtectionDesk: '116 / West Pokot Children Desk', gbvDesk: '1195 / Kapenguria Hospital Rescue Unit', partnerProgrammes: 'Girl Child Protection & Refuge, Youth Education Mentors' },
  { code: '025', name: 'Samburu', region: 'Rift Valley', capitalTown: 'Maralal', lat: 1.0968, lng: 36.698, mapX: 196, mapY: 118, emergencyPolice: '999 / Maralal Police Station', childProtectionDesk: '116 / Samburu Children Officer', gbvDesk: '1195 / Maralal Referral Protection Desk', partnerProgrammes: 'Child Protection Hotline Relay, Seasonal Family Relief' },
  { code: '026', name: 'Trans-Nzoia', region: 'Rift Valley', capitalTown: 'Kitale', lat: 1.0157, lng: 35.0062, mapX: 126, mapY: 132, emergencyPolice: '999 / Kitale Police Command', childProtectionDesk: '116 / Trans-Nzoia Child Officer', gbvDesk: '1195 / Kitale County Referral PRC', partnerProgrammes: 'Rift Children’s Home Visits, Family Recovery Counselling' },
  { code: '027', name: 'Uasin Gishu', region: 'Rift Valley', capitalTown: 'Eldoret', lat: 0.5143, lng: 35.2698, mapX: 144, mapY: 148, emergencyPolice: '999 / Eldoret Central Command', childProtectionDesk: '116 / Eldoret Children Services', gbvDesk: '1195 / MTRH Eldoret Safe Protection', partnerProgrammes: 'Partner Rehab Liaison, University Volunteer Chapters, ASD Care' },
  { code: '028', name: 'Elgeyo-Marakwet', region: 'Rift Valley', capitalTown: 'Iten', lat: 0.6703, lng: 35.5081, mapX: 156, mapY: 142, emergencyPolice: '999 / Iten Police Division', childProtectionDesk: '116 / Iten Children Desk', gbvDesk: '1195 / Iten Referral Gender Support', partnerProgrammes: 'Youth Sober Mentorship, Community Listening Evenings' },
  { code: '029', name: 'Nandi', region: 'Rift Valley', capitalTown: 'Kapsabet', lat: 0.2039, lng: 35.105, mapX: 140, mapY: 162, emergencyPolice: '999 / Kapsabet Police Command', childProtectionDesk: '116 / Nandi Children Welfare Desk', gbvDesk: '1195 / Kapsabet Referral Safe Unit', partnerProgrammes: 'School Stationery Drives, Family Counsellor Tele-Support' },
  { code: '030', name: 'Baringo', region: 'Rift Valley', capitalTown: 'Kabarnet', lat: 0.4919, lng: 35.743, mapX: 168, mapY: 148, emergencyPolice: '999 / Kabarnet Police Command', childProtectionDesk: '116 / Baringo Child Protection', gbvDesk: '1195 / Kabarnet Hospital Safe Desk', partnerProgrammes: 'Seasonal Hardship Relief Bundles, Safe Shelter Transport' },
  { code: '031', name: 'Laikipia', region: 'Rift Valley', capitalTown: 'Nanyuki', lat: 0.0167, lng: 37.0667, mapX: 215, mapY: 154, emergencyPolice: '999 / Nanyuki Police Command', childProtectionDesk: '116 / Laikipia Children Office', gbvDesk: '1195 / Nanyuki Teaching Referral GBV Unit', partnerProgrammes: 'Children’s Home CSR Visits, Mental Health Helpline' },
  { code: '032', name: 'Nakuru', region: 'Rift Valley', capitalTown: 'Nakuru', lat: -0.3031, lng: 36.08, mapX: 176, mapY: 184, emergencyPolice: '999 / Nakuru Central OCS', childProtectionDesk: '116 / Nakuru Children Services', gbvDesk: '1195 / Nakuru Level 5 PRC Safe Room', partnerProgrammes: 'Neema Cradle Home, Nakuru Trauma Sanctuary, Nov 28 Feast' },
  { code: '033', name: 'Narok', region: 'Rift Valley', capitalTown: 'Narok', lat: -1.0783, lng: 35.8601, mapX: 162, mapY: 218, emergencyPolice: '999 / Narok Police Command', childProtectionDesk: '116 / Narok Child Protection', gbvDesk: '1195 / Narok County Rescue Centre', partnerProgrammes: 'Child Safety Relocation, Community Food Cushioning' },
  { code: '034', name: 'Kajiado', region: 'Rift Valley', capitalTown: 'Kajiado', lat: -1.8524, lng: 36.7768, mapX: 202, mapY: 244, emergencyPolice: '999 / Kajiado & Kitengela Command', childProtectionDesk: '116 / Kajiado Child Officer', gbvDesk: '1195 / Kajiado Referral Protection Desk', partnerProgrammes: 'Safe Refuge Corridor, ASD Parent Support Groups' },
  { code: '035', name: 'Kericho', region: 'Rift Valley', capitalTown: 'Kericho', lat: -0.3677, lng: 35.2831, mapX: 146, mapY: 182, emergencyPolice: '999 / Kericho Police Station', childProtectionDesk: '116 / Kericho Children Desk', gbvDesk: '1195 / Kericho Referral Safe Desk', partnerProgrammes: 'Outpatient Recovery Access, Children’s Home Mentors' },
  { code: '036', name: 'Bomet', region: 'Rift Valley', capitalTown: 'Bomet', lat: -0.7813, lng: 35.3416, mapX: 150, mapY: 196, emergencyPolice: '999 / Bomet Police Command', childProtectionDesk: '116 / Bomet Children Services', gbvDesk: '1195 / Longisa Hospital Gender Unit', partnerProgrammes: 'Family Restoration Referrals, Pantry Care Baskets' },
  { code: '037', name: 'Kakamega', region: 'Western', capitalTown: 'Kakamega', lat: 0.2827, lng: 34.7519, mapX: 120, mapY: 156, emergencyPolice: '999 / Kakamega Central Police', childProtectionDesk: '116 / Kakamega Children Office', gbvDesk: '1195 / Kakamega PGH Gender Centre', partnerProgrammes: 'Western Children’s Homes, Peer Recovery Groups, Nov 28 Bundles' },
  { code: '038', name: 'Vihiga', region: 'Western', capitalTown: 'Mbale', lat: 0.0833, lng: 34.7167, mapX: 116, mapY: 168, emergencyPolice: '999 / Vihiga Police Command', childProtectionDesk: '116 / Vihiga Children Desk', gbvDesk: '1195 / Mbale Referral GBV Support', partnerProgrammes: 'School Feeding Support, ASD Home Guides' },
  { code: '039', name: 'Bungoma', region: 'Western', capitalTown: 'Bungoma', lat: 0.5635, lng: 34.5606, mapX: 112, mapY: 144, emergencyPolice: '999 / Bungoma Police Command', childProtectionDesk: '116 / Bungoma Child Protection', gbvDesk: '1195 / Bungoma Referral Safe Room', partnerProgrammes: 'Safeguarding & Domestic Safety Desk, Relief Bundles' },
  { code: '040', name: 'Busia', region: 'Western', capitalTown: 'Busia', lat: 0.4608, lng: 34.1115, mapX: 94, mapY: 152, emergencyPolice: '999 / Busia Border Police', childProtectionDesk: '116 / Busia Child Protection', gbvDesk: '1195 / Busia Referral Protection Unit', partnerProgrammes: 'Border Child Protection Alert Relay, Family Pantry Kits' },
  { code: '041', name: 'Siaya', region: 'Nyanza', capitalTown: 'Siaya', lat: 0.0612, lng: 34.2881, mapX: 96, mapY: 170, emergencyPolice: '999 / Siaya Police Station', childProtectionDesk: '116 / Siaya Children Officer', gbvDesk: '1195 / Siaya Referral PRC Unit', partnerProgrammes: 'Community Recovery Support, Grandmother & Child Meals' },
  { code: '042', name: 'Kisumu', region: 'Nyanza', capitalTown: 'Kisumu', lat: -0.0917, lng: 34.768, mapX: 114, mapY: 184, emergencyPolice: '999 / Kisumu Central Command', childProtectionDesk: '116 / Kisumu Children Office', gbvDesk: '1195 / JOOTRH Kisumu Safe Centre', partnerProgrammes: 'Lakeside Wholeness Rehab, Children’s Home Partners, Nov 28 Feast' },
  { code: '043', name: 'Homa Bay', region: 'Nyanza', capitalTown: 'Homa Bay', lat: -0.5273, lng: 34.4571, mapX: 100, mapY: 198, emergencyPolice: '999 / Homa Bay Police Command', childProtectionDesk: '116 / Homa Bay Children Office', gbvDesk: '1195 / Homa Bay Referral PRC', partnerProgrammes: 'Youth Protection & Safe Refuge, Community Food Bundles' },
  { code: '044', name: 'Migori', region: 'Nyanza', capitalTown: 'Migori', lat: -1.0634, lng: 34.4731, mapX: 102, mapY: 214, emergencyPolice: '999 / Migori Police Command', childProtectionDesk: '116 / Migori Child Welfare', gbvDesk: '1195 / Migori Referral Gender Desk', partnerProgrammes: 'Cross-Border Child Safeguarding, Family Restoration' },
  { code: '045', name: 'Kisii', region: 'Nyanza', capitalTown: 'Kisii', lat: -0.6817, lng: 34.7667, mapX: 120, mapY: 202, emergencyPolice: '999 / Kisii Central Police', childProtectionDesk: '116 / Kisii Children Office', gbvDesk: '1195 / Kisii Teaching Referral PRC', partnerProgrammes: 'ASD Family Outreach, Counselling & Burden-Share' },
  { code: '046', name: 'Nyamira', region: 'Nyanza', capitalTown: 'Nyamira', lat: -0.5633, lng: 34.9358, mapX: 132, mapY: 194, emergencyPolice: '999 / Nyamira Police Command', childProtectionDesk: '116 / Nyamira Child Protection', gbvDesk: '1195 / Nyamira County Gender Unit', partnerProgrammes: 'Children’s Home Support Packs, Rural Mental Health Desk' },
  { code: '047', name: 'Nairobi', region: 'Nairobi', capitalTown: 'Nairobi', lat: -1.2921, lng: 36.8219, mapX: 216, mapY: 218, emergencyPolice: '999 / Nairobi Command (Central, Kilimani, Karen)', childProtectionDesk: '116 / Nairobi Children Services HQ', gbvDesk: '1195 / Kenyatta & Nairobi Women’s GVRC', partnerProgrammes: 'Amani Gardens Sanctuary, Upendo Recovery Centre, Nov 28 National Feast Hub' },
];

export const ALL_47_COUNTY_NAMES: string[] = ALL_KENYA_COUNTIES.map((c) => c.name);

export function findKenyaCounty(nameOrCode: string): KenyaCountyInfo {
  const normalized = nameOrCode.trim().toLowerCase();
  return (
    ALL_KENYA_COUNTIES.find(
      (c) => c.name.toLowerCase() === normalized || c.code === normalized
    ) || ALL_KENYA_COUNTIES[46] // Nairobi default
  );
}

export function filterCountiesByRegion(region: 'All' | KenyaCountyInfo['region']): KenyaCountyInfo[] {
  if (region === 'All') return ALL_KENYA_COUNTIES;
  return ALL_KENYA_COUNTIES.filter((c) => c.region === region);
}

export function searchKenyaCounties(query: string): KenyaCountyInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_KENYA_COUNTIES;
  return ALL_KENYA_COUNTIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.capitalTown.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.partnerProgrammes.toLowerCase().includes(q)
  );
}

export interface EmergencyAuthorityAlertInput {
  county?: string;
  emergencyType?: string;
  authorityTarget?: string;
  locationLandmark?: string;
  callerAlias?: string;
  safeContact?: string;
  peopleAffected?: number;
  details?: string;
}

export function validateEmergencyAuthorityAlert(raw: EmergencyAuthorityAlertInput): {
  valid: boolean;
  errors: Record<string, string>;
  data?: {
    county: string;
    emergencyType: string;
    authorityTarget: string;
    locationLandmark: string;
    callerAlias: string;
    safeContact: string;
    peopleAffected: number;
    details: string;
  };
} {
  const errors: Record<string, string> = {};
  const countyInfo = findKenyaCounty(raw.county || 'Nairobi');
  const emergencyType = (raw.emergencyType || 'GBV / Immediate Domestic Danger').trim().slice(0, 100);
  const authorityTarget = (
    raw.authorityTarget || countyInfo.emergencyPolice
  )
    .trim()
    .slice(0, 140);
  const locationLandmark = (raw.locationLandmark || '').trim().slice(0, 160);
  const callerAlias = (raw.callerAlias || 'Protected Caller').trim().slice(0, 80) || 'Protected Caller';
  const safeContact = (raw.safeContact || '').trim().slice(0, 120);
  const peopleNum = Number(raw.peopleAffected || 1);
  const peopleAffected = Number.isFinite(peopleNum) ? Math.max(1, Math.min(30, Math.round(peopleNum))) : 1;
  const details = (raw.details || '').trim().slice(0, 600);

  if (locationLandmark.length < 3) {
    errors.locationLandmark = 'Please share the nearest town, estate, or landmark for response teams.';
  }
  if (safeContact.length < 4) {
    errors.safeContact = 'Please include a safe phone number or nearby trusted contact.';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: {},
    data: {
      county: countyInfo.name,
      emergencyType,
      authorityTarget,
      locationLandmark,
      callerAlias,
      safeContact,
      peopleAffected,
      details,
    },
  };
}
