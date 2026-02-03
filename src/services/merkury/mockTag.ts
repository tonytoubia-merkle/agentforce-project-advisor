import { getPersonaById } from '@/mocks/customerPersonas';
import type { AppendedProfile } from '@/types/customer';

export interface MerkuryResolution {
  merkuryId: string | null;
  identityTier: 'known' | 'appended' | 'anonymous';
  confidence: number;
  appendedData?: AppendedProfile;
}

export async function resolveMerkuryIdentity(personaId: string): Promise<MerkuryResolution> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200));

  const persona = getPersonaById(personaId);
  if (!persona) {
    return { merkuryId: null, identityTier: 'anonymous', confidence: 0 };
  }

  const profile = persona.profile;
  const identity = profile.merkuryIdentity;

  return {
    merkuryId: identity?.merkuryId || null,
    identityTier: identity?.identityTier || 'anonymous',
    confidence: identity?.confidence || 0,
    appendedData: profile.appendedProfile,
  };
}
