import type { CustomerProfile } from '@/types/customer';

export interface PersonaMeta {
  id: string;
  label: string;
  subtitle: string;
  traits: string[];
  profile: CustomerProfile;
  space: 'consumer' | 'b2b';
}

// ═══════════════════════════════════════════════════════════════
// CONSUMER PERSONAS
// ═══════════════════════════════════════════════════════════════

// ─── Mike Chen: Known Consumer, Loyalty Pro ──────────────────
// Active DIYer, kitchen renovation in progress, 5 orders, loyalty member
const mikeChen: CustomerProfile = {
  id: 'persona-mike',
  name: 'Mike',
  email: 'mike.chen@example.com',
  space: 'consumer',

  projectProfile: {
    skillLevel: 'intermediate',
    homeType: 'Single-family home',
    homeAge: '25 years',
    projectTypes: ['kitchen renovation', 'deck building'],
    concerns: ['budget management', 'code compliance', 'timeline'],
    preferredBrands: ['PROCRAFT', 'COLORPRO'],
  },

  orders: [
    {
      orderId: 'ORD-2025-0847',
      orderDate: '2025-06-12',
      channel: 'online',
      status: 'completed',
      totalAmount: 218.00,
      lineItems: [
        { productId: 'drill-cordless-20v', productName: '20V MAX Cordless Drill/Driver Kit', quantity: 1, unitPrice: 129.00 },
        { productId: 'saw-circular-7in', productName: '7-1/4 in. Circular Saw', quantity: 1, unitPrice: 89.00 },
      ],
    },
    {
      orderId: 'ORD-2025-1203',
      orderDate: '2025-09-08',
      channel: 'in-store',
      status: 'completed',
      totalAmount: 449.00,
      lineItems: [
        { productId: 'vanity-36in', productName: '36 in. Bathroom Vanity with Top', quantity: 1, unitPrice: 449.00 },
      ],
    },
    {
      orderId: 'ORD-2025-1456',
      orderDate: '2025-11-15',
      channel: 'online',
      status: 'completed',
      totalAmount: 84.00,
      lineItems: [
        { productId: 'paint-interior-gallon', productName: 'Premium Interior Paint + Primer', quantity: 2, unitPrice: 42.00 },
      ],
    },
    {
      orderId: 'ORD-2025-1789',
      orderDate: '2025-12-20',
      channel: 'online',
      status: 'completed',
      totalAmount: 229.00,
      lineItems: [
        { productId: 'faucet-kitchen-pulldown', productName: 'Touchless Pull-Down Kitchen Faucet', quantity: 1, unitPrice: 229.00 },
      ],
    },
    {
      orderId: 'ORD-2026-0055',
      orderDate: '2026-01-10',
      channel: 'online',
      status: 'completed',
      totalAmount: 89.00,
      lineItems: [
        { productId: 'light-recessed-6pk', productName: 'Ultra-Thin LED Recessed Lighting 6-Pack', quantity: 1, unitPrice: 89.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-09-08',
      summary: 'Mike visited in-store for bathroom vanity advice. Replacing a 30-inch vanity with a 36-inch. Needed guidance on plumbing adjustments. Recommended the 36in vanity set with cultured marble top.',
      sentiment: 'positive',
      topicsDiscussed: ['bathroom renovation', 'vanity sizing', 'plumbing'],
    },
    {
      sessionDate: '2025-12-18',
      summary: 'Mike asked about kitchen renovation planning. Currently doing a full kitchen remodel — cabinets, countertops, lighting, and faucet. Wants to stay under $15k total. Already bought the faucet and is now planning recessed lighting layout.',
      sentiment: 'positive',
      topicsDiscussed: ['kitchen renovation', 'budget planning', 'lighting layout', 'timeline'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'project',
      description: 'Full kitchen renovation in progress — cabinets, countertops, lighting, faucet. Budget: $15k.',
      capturedAt: '2025-12-18',
      agentNote: 'Bought faucet and recessed lights. Still needs countertop, backsplash, cabinet hardware. Likely needs paint too.',
    },
    {
      eventType: 'preference',
      description: 'Prefers to DIY where possible but hires out plumbing and electrical',
      capturedAt: '2025-09-08',
      agentNote: 'Intermediate skill. Comfortable with tools but respects code requirements.',
    },
    {
      eventType: 'intent',
      description: 'Planning to build a deck in spring — browsing composite decking options',
      capturedAt: '2026-01-20',
      agentNote: 'Deck project is next after kitchen. Interested in low-maintenance composite.',
    },
  ],

  agentCapturedProfile: {
    homeType: {
      value: 'Single-family home, 25 years old, 1,800 sq ft',
      capturedAt: '2025-09-08',
      capturedFrom: 'chat session 2025-09-08',
      confidence: 'stated',
    },
    skillLevel: {
      value: 'Intermediate DIYer — does paint, tile, basic carpentry. Hires out plumbing/electrical.',
      capturedAt: '2025-09-08',
      capturedFrom: 'chat session 2025-09-08',
      confidence: 'stated',
    },
    budget: {
      value: 'Kitchen renovation budget: $15,000 total',
      capturedAt: '2025-12-18',
      capturedFrom: 'chat session 2025-12-18',
      confidence: 'stated',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-20',
      categoriesBrowsed: ['decking', 'outdoor'],
      productsViewed: ['decking-composite-16ft', 'patio-paver-bundle'],
      durationMinutes: 12,
      device: 'desktop',
    },
    {
      sessionDate: '2026-01-28',
      categoriesBrowsed: ['flooring', 'paint'],
      productsViewed: ['flooring-vinyl-plank', 'paint-interior-gallon'],
      durationMinutes: 8,
      device: 'mobile',
    },
  ],

  loyalty: {
    tier: 'pro',
    pointsBalance: 3200,
    lifetimePoints: 5800,
    memberSince: '2024-11-01',
    rewardsAvailable: [
      { name: '$20 off next purchase', pointsCost: 2000 },
      { name: 'Free tool rental weekend', pointsCost: 3000 },
    ],
    nextTierThreshold: 8000,
    tierExpiryDate: '2026-11-01',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-MC-90210',
    identityTier: 'known',
    confidence: 0.97,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-1', type: 'card', last4: '4242', brand: 'visa', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-1', name: 'Mike Chen', line1: '123 Maple Drive', city: 'Portland', state: 'OR', postalCode: '97201', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 1069,
};

// ─── Sarah Martinez: Known Consumer, First-Time Homeowner ──────
// Just bought a home, needs everything, beginner skill
const saraMartinez: CustomerProfile = {
  id: 'persona-sara',
  name: 'Sara',
  email: 'sara.martinez@example.com',
  space: 'consumer',

  projectProfile: {
    skillLevel: 'beginner',
    homeType: 'Townhouse',
    homeAge: '10 years',
    projectTypes: ['painting', 'small repairs'],
    concerns: ['where to start', 'not breaking things', 'budget'],
    preferredBrands: [],
  },

  orders: [
    {
      orderId: 'ORD-2026-0102',
      orderDate: '2026-01-15',
      channel: 'online',
      status: 'completed',
      totalAmount: 42.00,
      lineItems: [
        { productId: 'paint-interior-gallon', productName: 'Premium Interior Paint + Primer', quantity: 1, unitPrice: 42.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2026-01-15',
      summary: 'Sara just bought her first home — a townhouse. Wants to paint the living room but has never painted before. Recommended the premium paint+primer and walked through supplies needed (rollers, tape, drop cloth). She asked about fixing a running toilet too.',
      sentiment: 'positive',
      topicsDiscussed: ['first-time homeowner', 'painting basics', 'toilet repair'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'life-event',
      description: 'Just purchased first home — a townhouse, closing was December 2025',
      capturedAt: '2026-01-15',
      agentNote: 'Total beginner. Will need guidance on every project. Good candidate for how-to content and starter kits.',
    },
    {
      eventType: 'intent',
      description: 'Wants to paint living room and fix a running toilet',
      capturedAt: '2026-01-15',
      agentNote: 'Start with paint supplies kit and toilet repair kit. Keep recommendations simple.',
    },
  ],

  agentCapturedProfile: {
    homeType: {
      value: 'Townhouse, 10 years old',
      capturedAt: '2026-01-15',
      capturedFrom: 'chat session 2026-01-15',
      confidence: 'stated',
    },
    skillLevel: {
      value: 'Complete beginner — first-time homeowner, has never done any home projects',
      capturedAt: '2026-01-15',
      capturedFrom: 'chat session 2026-01-15',
      confidence: 'stated',
    },
  },

  browseSessions: [],
  loyalty: null,

  merkuryIdentity: {
    merkuryId: 'MRK-SM-78701',
    identityTier: 'known',
    confidence: 0.88,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-2', type: 'card', last4: '8888', brand: 'mastercard', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-2', name: 'Sara Martinez', line1: '456 Oak Lane', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 42,
};

// ─── Tom Bradley: Known Consumer, Outdoor Enthusiast ──────────
// Focuses on outdoor/deck projects, good with tools
const tomBradley: CustomerProfile = {
  id: 'persona-tom',
  name: 'Tom',
  email: 'tom.bradley@example.com',
  space: 'consumer',

  projectProfile: {
    skillLevel: 'advanced',
    homeType: 'Single-family home with large yard',
    homeAge: '15 years',
    projectTypes: ['deck building', 'outdoor living', 'fencing'],
    concerns: ['weather resistance', 'low maintenance', 'curb appeal'],
    preferredBrands: ['DECKLIFE', 'PROCRAFT'],
  },

  orders: [
    {
      orderId: 'ORD-2025-0501',
      orderDate: '2025-05-10',
      channel: 'online',
      status: 'completed',
      totalAmount: 840.00,
      lineItems: [
        { productId: 'decking-composite-16ft', productName: 'Composite Deck Board 16 ft', quantity: 20, unitPrice: 42.00 },
      ],
    },
    {
      orderId: 'ORD-2025-0890',
      orderDate: '2025-08-22',
      channel: 'online',
      status: 'completed',
      totalAmount: 92.00,
      lineItems: [
        { productId: 'stain-deck', productName: 'Premium Deck Stain & Sealer', quantity: 2, unitPrice: 38.00 },
        { productId: 'detector-smoke-co', productName: 'Smart Smoke & CO Detector', quantity: 1, unitPrice: 39.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-05-10',
      summary: 'Tom is building a 400 sq ft composite deck. Already has the framing plan. Ordered composite boards and asked about hidden fastener systems and railing options. Very knowledgeable — has built decks before but first time with composite.',
      sentiment: 'positive',
      topicsDiscussed: ['deck building', 'composite decking', 'fasteners', 'railing'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'project',
      description: 'Building a 400 sq ft composite deck — framing complete, decking boards ordered',
      capturedAt: '2025-05-10',
      agentNote: 'Experienced builder, first time with composite. Needs railing, fasteners, and finishing supplies.',
    },
    {
      eventType: 'intent',
      description: 'Planning a patio extension with pavers adjacent to the new deck',
      capturedAt: '2026-01-05',
      agentNote: 'Considering paver patio kit. Wants to do it himself.',
    },
  ],

  agentCapturedProfile: {
    skillLevel: {
      value: 'Advanced DIYer — has built previous decks, comfortable with power tools and structural work',
      capturedAt: '2025-05-10',
      capturedFrom: 'chat session 2025-05-10',
      confidence: 'stated',
    },
    homeType: {
      value: 'Single-family home with large yard, 15 years old',
      capturedAt: '2025-05-10',
      capturedFrom: 'chat session 2025-05-10',
      confidence: 'stated',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-25',
      categoriesBrowsed: ['outdoor', 'decking'],
      productsViewed: ['patio-paver-bundle', 'decking-composite-16ft'],
      durationMinutes: 15,
      device: 'desktop',
    },
  ],

  loyalty: {
    tier: 'gold',
    pointsBalance: 1800,
    lifetimePoints: 3200,
    memberSince: '2025-05-10',
    rewardsAvailable: [
      { name: '10% off outdoor category', pointsCost: 1500 },
    ],
    tierExpiryDate: '2026-05-10',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-TB-30302',
    identityTier: 'known',
    confidence: 0.94,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-3', type: 'card', last4: '1234', brand: 'amex', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-3', name: 'Tom Bradley', line1: '789 Pine Ridge Rd', city: 'Denver', state: 'CO', postalCode: '80203', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 932,
};

// ─── Appended Consumer ────────────────────────────────────────
const appendedConsumer: CustomerProfile = {
  id: 'persona-appended-consumer',
  name: 'Guest',
  email: '',
  space: 'consumer',

  projectProfile: {
    concerns: [],
    preferredBrands: [],
  },

  orders: [],
  chatSummaries: [],
  meaningfulEvents: [],
  browseSessions: [],
  loyalty: null,
  purchaseHistory: [],
  savedPaymentMethods: [],
  shippingAddresses: [],
  recentActivity: [],

  merkuryIdentity: {
    merkuryId: 'MRK-AC-10001',
    identityTier: 'appended',
    confidence: 0.74,
    resolvedAt: new Date().toISOString(),
  },

  appendedProfile: {
    ageRange: '30-40',
    gender: 'male',
    householdIncome: '$100k-$150k',
    hasChildren: true,
    homeOwnership: 'own',
    interests: ['home improvement', 'smart home', 'outdoor living'],
    lifestyleSignals: ['suburban homeowner', 'weekend DIYer'],
    geoRegion: 'Atlanta Metro',
  },
};

// ─── Anonymous Consumer ──────────────────────────────────────
const anonymousConsumer: CustomerProfile = {
  id: 'persona-anonymous-consumer',
  name: 'Guest',
  email: '',
  space: 'consumer',

  projectProfile: {
    concerns: [],
    preferredBrands: [],
  },

  orders: [],
  chatSummaries: [],
  meaningfulEvents: [],
  browseSessions: [],
  loyalty: null,
  purchaseHistory: [],
  savedPaymentMethods: [],
  shippingAddresses: [],
  recentActivity: [],

  merkuryIdentity: {
    merkuryId: '',
    identityTier: 'anonymous',
    confidence: 0,
    resolvedAt: new Date().toISOString(),
  },
};

// ═══════════════════════════════════════════════════════════════
// B2B / PRO PERSONAS
// ═══════════════════════════════════════════════════════════════

// ─── Dave Kowalski: General Contractor ──────────────────────────
const daveKowalski: CustomerProfile = {
  id: 'persona-dave-gc',
  name: 'Dave',
  email: 'dave@kowalski-construction.com',
  space: 'b2b',

  projectProfile: {
    skillLevel: 'professional',
    companyName: 'Kowalski Construction LLC',
    companyType: 'General Contractor',
    tradeSpecialty: ['residential new construction', 'remodeling'],
    licenseNumber: 'GC-2024-87654',
    concerns: ['material availability', 'bulk pricing', 'delivery scheduling'],
    preferredBrands: ['TRUESTOCK', 'THERMACORE'],
  },

  orders: [
    {
      orderId: 'PO-2025-4401',
      orderDate: '2025-08-15',
      channel: 'pro-desk',
      status: 'completed',
      totalAmount: 7800.00,
      lineItems: [
        { productId: 'lumber-2x4-stud-bundle', productName: '2x4x8 Kiln-Dried Stud — 100 Pack', quantity: 10, unitPrice: 389.00 },
        { productId: 'plywood-sheathing-osb', productName: '7/16 in. OSB Sheathing', quantity: 200, unitPrice: 16.75 },
      ],
    },
    {
      orderId: 'PO-2025-4892',
      orderDate: '2025-10-20',
      channel: 'online',
      status: 'completed',
      totalAmount: 4250.00,
      lineItems: [
        { productId: 'insulation-r19-bundle', productName: 'R-19 Fiberglass Batt Insulation', quantity: 50, unitPrice: 45.00 },
        { productId: 'drywall-sheet-50pk', productName: '1/2 in. Drywall — 50 Sheet Bundle', quantity: 3, unitPrice: 625.00 },
      ],
    },
    {
      orderId: 'PO-2026-0112',
      orderDate: '2026-01-12',
      channel: 'pro-desk',
      status: 'processing',
      totalAmount: 5890.00,
      lineItems: [
        { productId: 'roofing-shingle-bundle', productName: 'Architectural Asphalt Shingles', quantity: 90, unitPrice: 29.00 },
        { productId: 'wire-romex-250ft', productName: '12/2 NM-B Romex Wire — 250 ft', quantity: 15, unitPrice: 89.00 },
        { productId: 'concrete-mix-80lb', productName: 'Fast-Setting Concrete Mix', quantity: 120, unitPrice: 5.40 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-08-15',
      summary: 'Dave is framing a 3,200 sq ft custom home. Ordered lumber and sheathing for delivery to jobsite. Needs materials staged in two deliveries — first for framing, second for sheathing. Asked about bulk pricing tiers.',
      sentiment: 'positive',
      topicsDiscussed: ['new construction', 'framing materials', 'bulk pricing', 'delivery scheduling'],
    },
    {
      sessionDate: '2026-01-12',
      summary: 'Dave is working on the same custom home — now at roofing and rough-in electrical stage. Ordered shingles, romex wire, and concrete for footings. Asked about credit terms for the next material order.',
      sentiment: 'positive',
      topicsDiscussed: ['roofing', 'electrical', 'concrete', 'credit terms', 'project timeline'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'project',
      description: 'Building 3,200 sq ft custom home — currently at roofing/rough-in stage. Full materials list expected over 6 months.',
      capturedAt: '2026-01-12',
      agentNote: 'High-value ongoing project. Needs drywall, insulation, roofing complete. Plumbing and HVAC upcoming.',
    },
    {
      eventType: 'preference',
      description: 'Prefers jobsite delivery with 48-hour advance scheduling. Two-stage delivery for large orders.',
      capturedAt: '2025-08-15',
      agentNote: 'Coordinate delivery windows. Has a foreman on site to receive.',
    },
  ],

  agentCapturedProfile: {
    teamSize: {
      value: 'Crew of 8-12 depending on phase',
      capturedAt: '2025-08-15',
      capturedFrom: 'chat session 2025-08-15',
      confidence: 'stated',
    },
    projectVolume: {
      value: '4-6 homes per year, mix of custom and spec',
      capturedAt: '2025-08-15',
      capturedFrom: 'chat session 2025-08-15',
      confidence: 'stated',
    },
    deliveryPreference: {
      value: 'Jobsite delivery, 48-hour advance notice, staged deliveries for large orders',
      capturedAt: '2025-08-15',
      capturedFrom: 'chat session 2025-08-15',
      confidence: 'stated',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-28',
      categoriesBrowsed: ['hvac', 'plumbing'],
      productsViewed: ['hvac-mini-split'],
      durationMinutes: 8,
      device: 'desktop',
    },
  ],

  loyalty: {
    tier: 'diamond',
    pointsBalance: 24500,
    lifetimePoints: 52000,
    memberSince: '2023-03-01',
    rewardsAvailable: [
      { name: '5% rebate on next order', pointsCost: 10000 },
      { name: 'Dedicated account manager', pointsCost: 0 },
    ],
    tierExpiryDate: '2027-03-01',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-DK-60614',
    identityTier: 'known',
    confidence: 0.99,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-4', type: 'net-30', brand: 'business-credit', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-4', name: 'Kowalski Construction LLC', line1: '100 Industrial Blvd', city: 'Chicago', state: 'IL', postalCode: '60614', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 87500,
};

// ─── Lisa Park: Property Manager / Multi-Unit ──────────────────
const lisaPark: CustomerProfile = {
  id: 'persona-lisa-pm',
  name: 'Lisa',
  email: 'lisa@parkproperties.com',
  space: 'b2b',

  projectProfile: {
    skillLevel: 'professional',
    companyName: 'Park Properties Management',
    companyType: 'Property Management',
    tradeSpecialty: ['multi-unit renovation', 'maintenance'],
    concerns: ['unit turnover speed', 'consistent finishes', 'cost per unit'],
    preferredBrands: ['COLORPRO', 'AQUAFLOW', 'FLOORMASTER'],
  },

  orders: [
    {
      orderId: 'PO-2025-6201',
      orderDate: '2025-07-20',
      channel: 'online',
      status: 'completed',
      totalAmount: 2890.00,
      lineItems: [
        { productId: 'paint-interior-gallon', productName: 'Premium Interior Paint + Primer', quantity: 40, unitPrice: 42.00 },
        { productId: 'flooring-vinyl-plank', productName: 'Luxury Vinyl Plank Flooring', quantity: 350, unitPrice: 3.29 },
      ],
    },
    {
      orderId: 'PO-2025-6789',
      orderDate: '2025-11-10',
      channel: 'pro-desk',
      status: 'completed',
      totalAmount: 5780.00,
      lineItems: [
        { productId: 'faucet-kitchen-pulldown', productName: 'Touchless Pull-Down Kitchen Faucet', quantity: 8, unitPrice: 229.00 },
        { productId: 'toilet-dual-flush', productName: 'WaterSense Dual-Flush Toilet', quantity: 12, unitPrice: 289.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-07-20',
      summary: 'Lisa manages 45 rental units and is doing a rolling renovation across 8 units this quarter. Needs consistent paint color and flooring across all units. Ordered paint and LVP in bulk. Asked about quantity discount for repeat orders.',
      sentiment: 'positive',
      topicsDiscussed: ['multi-unit renovation', 'bulk ordering', 'consistency', 'quantity discounts'],
    },
    {
      sessionDate: '2025-11-10',
      summary: 'Lisa is upgrading plumbing fixtures across 12 units. Needs same faucet and toilet model for all. Asked about delivery to multiple addresses and warranty for commercial use.',
      sentiment: 'positive',
      topicsDiscussed: ['plumbing fixtures', 'multi-unit', 'commercial warranty', 'multi-address delivery'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'project',
      description: 'Rolling renovation across 45-unit portfolio — 8 units per quarter, standardized finishes',
      capturedAt: '2025-07-20',
      agentNote: 'High-volume recurring customer. Needs same SKUs every quarter. Set up standing order templates.',
    },
    {
      eventType: 'preference',
      description: 'Requires consistent product availability — same color, same model across all units',
      capturedAt: '2025-07-20',
      agentNote: 'Lock in specific paint colors and flooring SKUs for her account to avoid variation.',
    },
  ],

  agentCapturedProfile: {
    projectVolume: {
      value: '45 units managed, 8 units renovated per quarter',
      capturedAt: '2025-07-20',
      capturedFrom: 'chat session 2025-07-20',
      confidence: 'stated',
    },
    deliveryPreference: {
      value: 'Delivery to multiple property addresses, staged by unit',
      capturedAt: '2025-11-10',
      capturedFrom: 'chat session 2025-11-10',
      confidence: 'stated',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-22',
      categoriesBrowsed: ['lighting', 'hardware'],
      productsViewed: ['light-recessed-6pk', 'lock-smartdead'],
      durationMinutes: 10,
      device: 'desktop',
    },
  ],

  loyalty: {
    tier: 'platinum',
    pointsBalance: 15200,
    lifetimePoints: 32000,
    memberSince: '2024-05-01',
    rewardsAvailable: [
      { name: 'Free delivery on orders over $500', pointsCost: 0 },
      { name: '3% rebate Q1', pointsCost: 5000 },
    ],
    tierExpiryDate: '2027-05-01',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-LP-30302',
    identityTier: 'known',
    confidence: 0.96,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-5', type: 'net-30', brand: 'business-credit', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-5', name: 'Park Properties - Main Office', line1: '500 Commerce St', city: 'Nashville', state: 'TN', postalCode: '37203', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 45600,
};

// ─── Appended B2B ───────────────────────────────────────────
const appendedB2B: CustomerProfile = {
  id: 'persona-appended-b2b',
  name: 'Guest',
  email: '',
  space: 'b2b',

  projectProfile: {
    companyType: 'Unknown',
    concerns: [],
    preferredBrands: [],
  },

  orders: [],
  chatSummaries: [],
  meaningfulEvents: [],
  browseSessions: [],
  loyalty: null,
  purchaseHistory: [],
  savedPaymentMethods: [],
  shippingAddresses: [],
  recentActivity: [],

  merkuryIdentity: {
    merkuryId: 'MRK-AB-20001',
    identityTier: 'appended',
    confidence: 0.68,
    resolvedAt: new Date().toISOString(),
  },

  appendedProfile: {
    interests: ['commercial construction', 'building materials', 'contractor tools'],
    lifestyleSignals: ['licensed contractor', 'commercial projects'],
    geoRegion: 'Dallas-Fort Worth',
  },
};

// ─── Anonymous B2B ──────────────────────────────────────────
const anonymousB2B: CustomerProfile = {
  id: 'persona-anonymous-b2b',
  name: 'Guest',
  email: '',
  space: 'b2b',

  projectProfile: {
    concerns: [],
    preferredBrands: [],
  },

  orders: [],
  chatSummaries: [],
  meaningfulEvents: [],
  browseSessions: [],
  loyalty: null,
  purchaseHistory: [],
  savedPaymentMethods: [],
  shippingAddresses: [],
  recentActivity: [],

  merkuryIdentity: {
    merkuryId: '',
    identityTier: 'anonymous',
    confidence: 0,
    resolvedAt: new Date().toISOString(),
  },
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const PERSONAS: PersonaMeta[] = [
  // Consumer
  {
    id: 'mike',
    label: 'Mike Chen',
    subtitle: 'Known · Loyalty Pro',
    traits: ['Kitchen reno in progress', '5 orders', 'Intermediate DIYer', 'Deck project planned', '3,200 pts'],
    profile: mikeChen,
    space: 'consumer',
  },
  {
    id: 'sara',
    label: 'Sara Martinez',
    subtitle: 'Known · New Homeowner',
    traits: ['First-time homeowner', 'Beginner', '1 order', 'Needs guidance', 'Townhouse'],
    profile: saraMartinez,
    space: 'consumer',
  },
  {
    id: 'tom',
    label: 'Tom Bradley',
    subtitle: 'Known · Loyalty Gold',
    traits: ['Advanced DIYer', 'Deck builder', '2 orders', 'Outdoor focus', '1,800 pts'],
    profile: tomBradley,
    space: 'consumer',
  },
  {
    id: 'appended-consumer',
    label: 'Appended Visitor',
    subtitle: 'Merkury Appended Only',
    traits: ['New to brand', 'Suburban homeowner', 'Smart home interest', 'Atlanta', 'No history'],
    profile: appendedConsumer,
    space: 'consumer',
  },
  {
    id: 'anonymous-consumer',
    label: 'Anonymous Visitor',
    subtitle: 'Merkury: No Match',
    traits: ['No identity resolved', 'No history', 'Discovery mode'],
    profile: anonymousConsumer,
    space: 'consumer',
  },

  // B2B
  {
    id: 'dave-gc',
    label: 'Dave Kowalski',
    subtitle: 'General Contractor · Diamond',
    traits: ['Kowalski Construction', '3 POs', 'Custom home build', 'Jobsite delivery', '$87.5k LTV'],
    profile: daveKowalski,
    space: 'b2b',
  },
  {
    id: 'lisa-pm',
    label: 'Lisa Park',
    subtitle: 'Property Manager · Platinum',
    traits: ['Park Properties', '45 units', 'Rolling renos', 'Bulk orders', '$45.6k LTV'],
    profile: lisaPark,
    space: 'b2b',
  },
  {
    id: 'appended-b2b',
    label: 'Appended Pro Visitor',
    subtitle: 'Merkury Appended Only',
    traits: ['Licensed contractor', 'Commercial projects', 'Dallas', 'No history'],
    profile: appendedB2B,
    space: 'b2b',
  },
  {
    id: 'anonymous-b2b',
    label: 'Anonymous Pro Visitor',
    subtitle: 'Merkury: No Match',
    traits: ['No identity resolved', 'No history', 'Discovery mode'],
    profile: anonymousB2B,
    space: 'b2b',
  },
];

export function getPersonaById(id: string): PersonaMeta | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function getPersonasBySpace(space: 'consumer' | 'b2b'): PersonaMeta[] {
  return PERSONAS.filter((p) => p.space === space);
}

export interface PersonaStub {
  id: string;
  merkuryId: string;
  identityTier: 'known' | 'appended' | 'anonymous';
  defaultLabel: string;
  defaultSubtitle: string;
  space: 'consumer' | 'b2b';
}

export const PERSONA_STUBS: PersonaStub[] = [
  // Consumer
  { id: 'mike', merkuryId: 'MRK-MC-90210', identityTier: 'known', defaultLabel: 'Mike Chen', defaultSubtitle: 'Merkury: Matched', space: 'consumer' },
  { id: 'sara', merkuryId: 'MRK-SM-78701', identityTier: 'known', defaultLabel: 'Sara Martinez', defaultSubtitle: 'Merkury: Matched', space: 'consumer' },
  { id: 'tom', merkuryId: 'MRK-TB-30302', identityTier: 'known', defaultLabel: 'Tom Bradley', defaultSubtitle: 'Merkury: Matched', space: 'consumer' },
  { id: 'appended-consumer', merkuryId: 'MRK-AC-10001', identityTier: 'appended', defaultLabel: 'Appended Visitor', defaultSubtitle: 'Merkury: Matched · Appended Only', space: 'consumer' },
  { id: 'anonymous-consumer', merkuryId: '', identityTier: 'anonymous', defaultLabel: 'Anonymous Visitor', defaultSubtitle: 'Merkury: No Match', space: 'consumer' },

  // B2B
  { id: 'dave-gc', merkuryId: 'MRK-DK-60614', identityTier: 'known', defaultLabel: 'Dave Kowalski', defaultSubtitle: 'Merkury: Matched', space: 'b2b' },
  { id: 'lisa-pm', merkuryId: 'MRK-LP-30302', identityTier: 'known', defaultLabel: 'Lisa Park', defaultSubtitle: 'Merkury: Matched', space: 'b2b' },
  { id: 'appended-b2b', merkuryId: 'MRK-AB-20001', identityTier: 'appended', defaultLabel: 'Appended Pro Visitor', defaultSubtitle: 'Merkury: Matched · Appended Only', space: 'b2b' },
  { id: 'anonymous-b2b', merkuryId: '', identityTier: 'anonymous', defaultLabel: 'Anonymous Pro Visitor', defaultSubtitle: 'Merkury: No Match', space: 'b2b' },
];
