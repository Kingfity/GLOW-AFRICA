import {
  PARENTING_CHALLENGE_PLAYBOOKS,
  type ChallengeCategoryId,
  type ParentingChallengePlaybook,
} from '../data/specialNeedsChallenges';

export function filterParentingPlaybooks(
  category: ChallengeCategoryId,
  searchQuery: string,
  playbooks: ParentingChallengePlaybook[] = PARENTING_CHALLENGE_PLAYBOOKS
): ParentingChallengePlaybook[] {
  const q = (searchQuery || '').trim().toLowerCase();
  return playbooks.filter((item) => {
    if (category !== 'all' && item.category !== category) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      item.categoryLabel,
      item.title,
      item.whatParentsFeel,
      item.whyItHappens,
      item.whatNeighboursCanDo,
      item.specialistDesk,
      ...item.practicalTips,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function buildCarePlanShareSummary(input: {
  guardianName: string;
  householdStructure: string;
  county: string;
  disabilityFocus: string;
  monthlyRespiteHours: number;
  savedChallengeIds: string[];
}): string {
  const matchedTitles = PARENTING_CHALLENGE_PLAYBOOKS.filter((p) =>
    input.savedChallengeIds.includes(p.id)
  ).map((p) => p.title);

  const lines = [
    `Household Care Plan for ${input.guardianName || 'Parent / Guardian'} (${input.householdStructure}, ${input.county} County)`,
    `Focus: ${input.disabilityFocus}`,
    `Target Support: ${input.monthlyRespiteHours} hrs/month neighbour/carer respite`,
  ];

  if (matchedTitles.length > 0) {
    lines.push(`Priority Daily Challenges Saved: ${matchedTitles.join(' | ')}`);
  }

  return lines.join('\n');
}

export function validateStoryAnimationInput(input: {
  dataUrl: string;
  prompt: string;
  aspectRatio: string;
}): { valid: boolean; error?: string; mimeType?: string; base64Data?: string } {
  const dataUrl = typeof input.dataUrl === 'string' ? input.dataUrl.trim() : '';
  const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) {
    return {
      valid: false,
      error: 'Please choose a valid PNG, JPG, or WEBP photograph first.',
    };
  }
  const approxBytes = Math.ceil((match[2].length * 3) / 4);
  if (approxBytes > 4 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Photo file size must stay under 4 MB for reliable video animation.',
    };
  }
  const aspectRatio = input.aspectRatio;
  if (aspectRatio !== '16:9' && aspectRatio !== '9:16') {
    return {
      valid: false,
      error: 'Aspect ratio must be either 16:9 (landscape) or 9:16 (portrait).',
    };
  }
  const cleanPrompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
  if (cleanPrompt.length < 6 || cleanPrompt.length > 500) {
    return {
      valid: false,
      error: 'Please enter a motion description between 6 and 500 characters.',
    };
  }
  return {
    valid: true,
    mimeType: `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}`,
    base64Data: match[2],
  };
}
