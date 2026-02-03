// ─── Data Provenance & Privacy ────────────────────────────────
export type IdentityTier = 'known' | 'appended' | 'anonymous';

export type DataProvenance =
  | 'stated'          // Customer explicitly told us
  | 'declared'        // Customer filled in a profile/preference form
  | 'observed'        // We saw them do it (purchase, browse, chat)
  | 'inferred'        // We derived it from behavior
  | 'agent_inferred'  // Agent captured from conversation
  | 'appended';       // Third-party enrichment (Merkury)

export type UsagePermission = 'direct' | 'soft' | 'influence_only';

export const PROVENANCE_USAGE: Record<DataProvenance, UsagePermission> = {
  stated: 'direct',
  declared: 'direct',
  observed: 'direct',
  inferred: 'soft',
  agent_inferred: 'soft',
  appended: 'influence_only',
};

export interface TaggedContextField {
  value: string;
  provenance: DataProvenance;
  usage: UsagePermission;
}

// ─── Identity ─────────────────────────────────────────────────
export interface MerkuryIdentity {
  merkuryId: string;
  identityTier: IdentityTier;
  confidence: number;
  resolvedAt: string;
}

export interface AppendedProfile {
  ageRange?: string;
  gender?: string;
  householdIncome?: string;
  hasChildren?: boolean;
  homeOwnership?: string;
  educationLevel?: string;
  interests?: string[];
  lifestyleSignals?: string[];
  geoRegion?: string;
}

// ─── Orders & History ─────────────────────────────────────────
export interface OrderLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  orderId: string;
  orderDate: string;
  channel: string;
  status: 'completed' | 'processing' | 'returned' | 'cancelled';
  totalAmount: number;
  lineItems: OrderLineItem[];
}

export interface ChatSummary {
  sessionDate: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  topicsDiscussed: string[];
}

export interface MeaningfulEvent {
  eventType: 'preference' | 'life-event' | 'concern' | 'intent' | 'milestone' | 'project';
  description: string;
  capturedAt: string;
  agentNote?: string;
  metadata?: Record<string, unknown>;
}

export interface BrowseSession {
  sessionDate: string;
  categoriesBrowsed: string[];
  productsViewed: string[];
  durationMinutes: number;
  device: string;
}

// ─── Profile & Preferences ────────────────────────────────────
export interface ProjectProfile {
  projectTypes?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  homeType?: string;
  homeAge?: string;
  concerns?: string[];
  preferredBrands?: string[];
  communicationPrefs?: { email: boolean; sms: boolean; push: boolean };
  /** B2B fields */
  companyName?: string;
  companyType?: string;
  tradeSpecialty?: string[];
  licenseNumber?: string;
}

export interface LoyaltyData {
  tier: string;
  pointsBalance: number;
  lifetimePoints: number;
  memberSince: string;
  rewardsAvailable?: { name: string; pointsCost: number }[];
  nextTierThreshold?: number;
  tierExpiryDate?: string;
}

export interface CapturedProfileField {
  value: string | string[];
  capturedAt: string;
  capturedFrom: string;
  confidence: 'stated' | 'inferred';
}

export interface AgentCapturedProfile {
  homeType?: CapturedProfileField;
  homeAge?: CapturedProfileField;
  projectTimeline?: CapturedProfileField;
  budget?: CapturedProfileField;
  skillLevel?: CapturedProfileField;
  preferredStyle?: CapturedProfileField;
  priorityArea?: CapturedProfileField;
  // B2B
  teamSize?: CapturedProfileField;
  projectVolume?: CapturedProfileField;
  preferredSupplier?: CapturedProfileField;
  deliveryPreference?: CapturedProfileField;
  [key: string]: CapturedProfileField | undefined;
}

// ─── Full Customer Profile ────────────────────────────────────
export interface CustomerProfile {
  id: string;
  name: string;
  email: string;

  projectProfile: ProjectProfile;

  orders: OrderRecord[];
  purchaseHistory: { productId: string; productName: string; purchaseDate: string; quantity: number; rating?: number }[];
  chatSummaries: ChatSummary[];
  meaningfulEvents: MeaningfulEvent[];
  browseSessions: BrowseSession[];

  loyalty: LoyaltyData | null;
  loyaltyTier?: string;
  lifetimeValue?: number;

  agentCapturedProfile?: AgentCapturedProfile;

  savedPaymentMethods: { id: string; type: string; last4?: string; brand?: string; isDefault: boolean }[];
  shippingAddresses: { id: string; name: string; line1: string; city: string; state: string; postalCode: string; country: string; isDefault: boolean }[];

  recentActivity?: RecentActivity[];

  merkuryIdentity?: MerkuryIdentity;
  appendedProfile?: AppendedProfile;

  /** Which space this persona belongs to */
  space: 'consumer' | 'b2b';
}

export interface RecentActivity {
  type: string;
  description: string;
  date: string;
  productIds?: string[];
  metadata?: Record<string, unknown>;
}

// ─── Session Context (sent to agent) ──────────────────────────
export interface CustomerSessionContext {
  customerId: string;
  name: string;
  email: string;
  identityTier: IdentityTier;
  space: 'consumer' | 'b2b';
  skillLevel?: string;
  concerns?: string[];
  recentPurchases: string[];
  recentActivity: string[];
  appendedInterests: string[];
  loyaltyTier?: string;
  loyaltyPoints?: number;
  chatContext: string[];
  meaningfulEvents: string[];
  browseInterests: string[];
  capturedProfile: string[];
  missingProfileFields: string[];
  taggedContext: TaggedContextField[];
  // B2B fields
  companyName?: string;
  tradeSpecialty?: string[];
}
