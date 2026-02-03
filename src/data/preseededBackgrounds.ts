/**
 * Pre-seeded background images for home improvement scenes.
 * Much more subdued than the retail/beauty version — backgrounds here are
 * utilitarian and professional. Many scenes just use gradients.
 */

export interface PreseededAsset {
  id: string;
  setting: string;
  path: string;
  tags: string[];
}

// For home improvement, we keep backgrounds minimal and professional.
// The B2B side especially should rely heavily on gradients rather than imagery.
export const PRESEEDED_BACKGROUNDS: PreseededAsset[] = [
  // Consumer scenes — light imagery
  { id: 'workshop-1', setting: 'workshop', path: '/assets/backgrounds/workshop-1.jpg', tags: ['workshop', 'tools'] },
  { id: 'workshop-2', setting: 'workshop', path: '/assets/backgrounds/workshop-2.jpg', tags: ['workshop', 'diy'] },
  { id: 'kitchen-1', setting: 'kitchen', path: '/assets/backgrounds/kitchen-1.jpg', tags: ['kitchen', 'renovation'] },
  { id: 'kitchen-2', setting: 'kitchen', path: '/assets/backgrounds/kitchen-2.jpg', tags: ['kitchen', 'modern'] },
  { id: 'bathroom-1', setting: 'bathroom', path: '/assets/backgrounds/bathroom-1.jpg', tags: ['bathroom', 'renovation'] },
  { id: 'outdoor-1', setting: 'outdoor', path: '/assets/backgrounds/outdoor-1.jpg', tags: ['outdoor', 'deck', 'patio'] },
  { id: 'outdoor-2', setting: 'outdoor', path: '/assets/backgrounds/outdoor-2.jpg', tags: ['outdoor', 'garden'] },
  { id: 'living-room-1', setting: 'living-room', path: '/assets/backgrounds/living-room-1.jpg', tags: ['living-room', 'interior'] },
  { id: 'garage-1', setting: 'garage', path: '/assets/backgrounds/garage-1.jpg', tags: ['garage', 'storage'] },

  // B2B/Pro scenes — minimal, clean
  { id: 'jobsite-1', setting: 'jobsite', path: '/assets/backgrounds/jobsite-1.jpg', tags: ['jobsite', 'construction'] },
  { id: 'warehouse-1', setting: 'warehouse', path: '/assets/backgrounds/warehouse-1.jpg', tags: ['warehouse', 'supply'] },

  // Neutral — used for welcome and fallback
  { id: 'neutral-1', setting: 'neutral', path: '/assets/backgrounds/neutral-1.jpg', tags: ['neutral', 'default'] },
  { id: 'neutral-2', setting: 'neutral', path: '/assets/backgrounds/neutral-2.jpg', tags: ['neutral', 'minimal'] },
];

// Track which variants have been shown to avoid repetition
const shownVariants = new Set<string>();

export function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Find a pre-seeded background for a given setting.
 * Rotates through variants to avoid showing the same image twice in a row.
 */
export function findPreseeded(setting: string): PreseededAsset | undefined {
  const matches = PRESEEDED_BACKGROUNDS.filter((bg) => bg.setting === setting);
  if (matches.length === 0) return undefined;

  // Try to pick one that hasn't been shown
  const unseen = matches.filter((bg) => !shownVariants.has(bg.id));
  const pick = unseen.length > 0 ? pickRandom(unseen) : pickRandom(matches);

  if (pick) {
    // If we've shown all variants, reset
    if (unseen.length === 0) shownVariants.clear();
    shownVariants.add(pick.id);
  }

  return pick;
}

/**
 * Check if a pre-seeded image file exists (best-effort; in dev, all local
 * files are assumed to exist).
 */
export async function preseededExists(asset: PreseededAsset): Promise<boolean> {
  try {
    const res = await fetch(asset.path, { method: 'HEAD' });
    return res.ok;
  } catch {
    // In dev without the actual image files, fall back gracefully
    return false;
  }
}
