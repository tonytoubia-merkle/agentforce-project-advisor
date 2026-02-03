import { useCallback, useRef } from 'react';
import type { SceneSetting, KnownSceneSetting } from '@/types/scene';
import type { Product } from '@/types/product';

/**
 * Home improvement backgrounds are deliberately subdued.
 * We use clean, professional gradients as the default — image generation
 * is largely disabled for this industry vertical. The B2B side especially
 * should feel utilitarian and content-focused, not experiential.
 */

const KNOWN_GRADIENTS: Record<KnownSceneSetting, string> = {
  neutral: 'linear-gradient(135deg, #1a2332 0%, #1e3a4f 50%, #1a2332 100%)',
  workshop: 'linear-gradient(135deg, #2c2416 0%, #3d3020 50%, #2c2416 100%)',
  kitchen: 'linear-gradient(135deg, #2a2520 0%, #3a3530 50%, #2a2520 100%)',
  bathroom: 'linear-gradient(135deg, #1e2a2e 0%, #2a3a40 50%, #1e2a2e 100%)',
  outdoor: 'linear-gradient(135deg, #1a2e1a 0%, #2a4030 50%, #1a3020 100%)',
  garage: 'linear-gradient(135deg, #252525 0%, #353535 50%, #252525 100%)',
  'living-room': 'linear-gradient(135deg, #2a2420 0%, #3a3430 50%, #2a2420 100%)',
  jobsite: 'linear-gradient(135deg, #2a2a20 0%, #3a3a30 50%, #2a2a20 100%)',
  warehouse: 'linear-gradient(135deg, #1f2028 0%, #2a2b35 50%, #1f2028 100%)',
};

export function getFallbackGradient(setting: SceneSetting): string {
  return KNOWN_GRADIENTS[setting as KnownSceneSetting] || KNOWN_GRADIENTS.neutral;
}

export const FALLBACK_GRADIENTS = KNOWN_GRADIENTS as Record<string, string>;

export interface BackgroundOptions {
  cmsAssetId?: string;
  cmsTag?: string;
  editMode?: boolean;
  editPrompt?: string;
  backgroundPrompt?: string;
  sceneAssetId?: string;
  imageUrl?: string;
  mood?: string;
  customerContext?: string;
  sceneType?: string;
}

export function useGenerativeBackground() {
  const cacheRef = useRef<Record<string, string>>({});

  const generateBackground = useCallback(
    async (setting: SceneSetting, _products: Product[], options?: BackgroundOptions): Promise<string> => {
      // For home improvement, we strongly prefer gradients and static images.
      // Generative backgrounds are almost never triggered — the UI is about
      // content and products, not atmospheric visuals.

      const cacheKey = options?.backgroundPrompt
        ? `${setting}-prompt-${options.backgroundPrompt.substring(0, 60)}`
        : options?.cmsAssetId || options?.cmsTag || setting;

      if (cacheRef.current[cacheKey]) {
        return cacheRef.current[cacheKey];
      }

      // Agent-provided imageUrl — use directly
      if (options?.imageUrl) {
        cacheRef.current[cacheKey] = options.imageUrl;
        return options.imageUrl;
      }

      // Try pre-seeded local background
      if (!options?.editMode) {
        try {
          const { findPreseeded, preseededExists } = await import('@/data/preseededBackgrounds');
          const preseeded = findPreseeded(setting);
          if (preseeded) {
            const exists = await preseededExists(preseeded);
            if (exists) {
              console.log('[bg] Using pre-seeded image for', setting, '→', preseeded.path);
              cacheRef.current[cacheKey] = preseeded.path;
              return preseeded.path;
            }
          }
        } catch {
          // Fall through to gradient
        }
      }

      // Default: gradient. No generation for home improvement.
      const gradient = getFallbackGradient(setting);
      cacheRef.current[cacheKey] = gradient;
      return gradient;
    },
    []
  );

  return { generateBackground };
}
