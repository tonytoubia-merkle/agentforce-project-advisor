import type { AgentResponse, UIAction } from '@/types/agent';
import type { CustomerSessionContext } from '@/types/customer';
import { MOCK_PRODUCTS } from '@/mocks/products';

interface ConversationState {
  lastShownProductIds: string[];
  currentProductId: string | null;
  shownCategories: string[];
  hasGreeted: boolean;
}

const state: ConversationState = {
  lastShownProductIds: [],
  currentProductId: null,
  shownCategories: [],
  hasGreeted: false,
};

let customerCtx: CustomerSessionContext | null = null;

export function setMockCustomerContext(ctx: CustomerSessionContext | null): void {
  customerCtx = ctx;
  state.lastShownProductIds = [];
  state.currentProductId = null;
  state.shownCategories = [];
  state.hasGreeted = false;
}

export interface MockAgentSnapshot {
  state: ConversationState;
  customerCtx: CustomerSessionContext | null;
}

export function getMockAgentSnapshot(): MockAgentSnapshot {
  return { state: { ...state }, customerCtx };
}

export function restoreMockAgentSnapshot(snapshot: MockAgentSnapshot): void {
  Object.assign(state, snapshot.state);
  customerCtx = snapshot.customerCtx;
}

const findProduct = (id: string) => MOCK_PRODUCTS.find((p) => p.id === id);

// ─── Enrichment probes for home improvement ────────────────────
const ENRICHMENT_PROBES: Record<string, string[]> = {
  'Home type': ['What type of home do you have?'],
  'Home age': ['How old is your home? It helps me recommend the right approach.'],
  'Project timeline': ['When are you hoping to get this done?'],
  'Budget': ['Do you have a budget range in mind?'],
  'Skill level': ['Have you done projects like this before?'],
  'Priority area': ['Which room or area is the top priority?'],
  // B2B
  'Team size': ['How large is your crew for this project?'],
  'Project volume': ['How many projects do you typically run per year?'],
  'Delivery preference': ['Do you need jobsite delivery or will-call?'],
};

function getEnrichmentProbe(): string | null {
  const missing = customerCtx?.missingProfileFields;
  if (!missing?.length) return null;
  const candidates = missing.filter((f) => ENRICHMENT_PROBES[f]);
  if (!candidates.length) return null;
  const field = candidates[Math.floor(Math.random() * candidates.length)];
  const probes = ENRICHMENT_PROBES[field];
  return probes[Math.floor(Math.random() * probes.length)];
}

// ─── Personalized welcome responses ────────────────────────────

function generateWelcomeResponse(): AgentResponse | null {
  if (state.hasGreeted) return null;
  state.hasGreeted = true;

  if (!customerCtx) return null;

  const tier = customerCtx.identityTier;
  const isB2B = customerCtx.space === 'b2b';

  if (tier === 'known') {
    const hasActiveProject = customerCtx.meaningfulEvents?.some((e) => e.includes('renovation') || e.includes('building') || e.includes('custom home'));
    const isNewHomeowner = customerCtx.meaningfulEvents?.some((e) => e.toLowerCase().includes('first home') || e.toLowerCase().includes('beginner'));
    const hasOutdoorInterest = customerCtx.browseInterests?.some((b) => b.includes('deck') || b.includes('outdoor'));
    const loyaltyInfo = customerCtx.loyaltyTier
      ? `${customerCtx.loyaltyTier} member${customerCtx.loyaltyPoints ? ` with ${customerCtx.loyaltyPoints.toLocaleString()} points` : ''}`
      : null;

    // B2B: General contractor with active project
    if (isB2B && hasActiveProject && loyaltyInfo) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}. How's the project coming along? As a ${loyaltyInfo}, your dedicated pricing is locked in.`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}`,
            welcomeSubtext: customerCtx.companyName
              ? `${customerCtx.companyName} — Let's keep your project on track.`
              : `Let's keep your project on track.`,
            sceneContext: {
              setting: 'jobsite',
              generateBackground: false,
            },
          },
        },
        suggestedActions: ['Check my order status', 'Reorder materials', 'Get a quote for next phase'],
        confidence: 0.98,
      };
    }

    // B2B: Property manager
    if (isB2B && loyaltyInfo) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}. Ready to set up your next order? As a ${loyaltyInfo}, you have preferred pricing on all your regular SKUs.`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}`,
            welcomeSubtext: customerCtx.companyName
              ? `${customerCtx.companyName} — Your account is ready.`
              : `Your Pro account is ready.`,
            sceneContext: {
              setting: 'warehouse',
              generateBackground: false,
            },
          },
        },
        suggestedActions: ['Reorder last order', 'Browse bulk materials', 'Request a quote'],
        confidence: 0.97,
      };
    }

    // Consumer: Active renovation project
    if (hasActiveProject && loyaltyInfo) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}! How's the renovation going? As a ${loyaltyInfo}, you've got some rewards to use.`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}!`,
            welcomeSubtext: `Let's tackle the next phase of your project. I can help you figure out what you need.`,
            sceneContext: {
              setting: 'kitchen',
              generateBackground: false,
            },
          },
        },
        suggestedActions: ['What do I need next?', 'Show me my project list', 'Help me plan my budget'],
        confidence: 0.98,
      };
    }

    // Consumer: First-time homeowner / beginner
    if (isNewHomeowner) {
      return {
        sessionId: 'mock-session',
        message: `Hey ${customerCtx.name}! Congrats on the new home. I'm here to help you figure out where to start — no project too small.`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome, ${customerCtx.name}!`,
            welcomeSubtext: `Your project advisor is here. Let's start with the basics and build from there.`,
            sceneContext: {
              setting: 'neutral',
              generateBackground: false,
            },
          },
        },
        suggestedActions: ['Where should I start?', 'Help me paint a room', 'Show me starter tool kits'],
        confidence: 0.96,
      };
    }

    // Consumer: Outdoor enthusiast / deck builder
    if (hasOutdoorInterest) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}! I see you've been looking at outdoor projects. Ready to plan your next build?`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}!`,
            welcomeSubtext: `Spring is coming — great time to plan that outdoor project.`,
            sceneContext: {
              setting: 'outdoor',
              generateBackground: false,
            },
          },
        },
        suggestedActions: ['Show me decking options', 'Help me plan a patio', 'Outdoor project ideas'],
        confidence: 0.96,
      };
    }

    // Generic known
    const loyaltySubtext = loyaltyInfo
      ? `As a ${loyaltyInfo}, you've got great deals waiting.`
      : "I can help you plan, find products, and get your project done right.";
    return {
      sessionId: 'mock-session',
      message: `Welcome back, ${customerCtx.name}! What project are you working on?`,
      uiDirective: {
        action: 'WELCOME_SCENE' as UIAction,
        payload: {
          welcomeMessage: `Welcome back, ${customerCtx.name}!`,
          welcomeSubtext: loyaltySubtext,
          sceneContext: {
            setting: 'neutral',
            generateBackground: false,
          },
        },
      },
      suggestedActions: ['Help me plan a project', 'Show me what\'s on sale', 'Restock supplies'],
      confidence: 0.95,
    };
  }

  if (tier === 'appended') {
    const interests = customerCtx.appendedInterests || [];
    const isContractor = interests.some((i) => i.includes('contractor') || i.includes('construction'));

    if (isB2B || isContractor) {
      return {
        sessionId: 'mock-session',
        message: "Welcome to your Pro project advisor. I can help with material quotes, bulk ordering, and project planning.",
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: 'Welcome',
            welcomeSubtext: 'Your Pro project advisor — bulk pricing, delivery scheduling, and material planning.',
            sceneContext: {
              setting: 'neutral',
              generateBackground: false,
            },
          },
        },
        suggestedActions: ['Get a bulk quote', 'Browse pro materials', 'Set up a pro account'],
        confidence: 0.9,
      };
    }

    return {
      sessionId: 'mock-session',
      message: "Welcome! I'm your project advisor. Whether you're tackling a renovation or a quick repair, I can help you find what you need.",
      uiDirective: {
        action: 'WELCOME_SCENE' as UIAction,
        payload: {
          welcomeMessage: 'Welcome!',
          welcomeSubtext: 'Your project advisor — from planning to products, I\'m here to help.',
          sceneContext: {
            setting: 'neutral',
            generateBackground: false,
          },
        },
      },
      suggestedActions: ['Help me plan a project', 'Show me bestsellers', 'I need help with a repair'],
      confidence: 0.9,
    };
  }

  // Anonymous
  return {
    sessionId: 'mock-session',
    message: "Welcome to your project advisor! I can help you plan projects, find the right products, and get expert advice. What are you working on?",
    uiDirective: {
      action: 'WELCOME_SCENE' as UIAction,
      payload: {
        welcomeMessage: 'Welcome!',
        welcomeSubtext: 'Your home improvement project advisor is ready to help.',
        sceneContext: {
          setting: 'neutral',
          generateBackground: false,
        },
      },
    },
    suggestedActions: ['Help me with a project', 'Show me power tools', 'I need paint recommendations'],
    confidence: 0.85,
  };
}

// ─── Standard response patterns ────────────────────────────────

const RESPONSE_PATTERNS: {
  pattern: RegExp;
  response: () => Partial<AgentResponse>;
}[] = [
  {
    pattern: /drill|driver|screw(driver)?|cordless/i,
    response: () => {
      const product = findProduct('drill-cordless-20v')!;
      state.currentProductId = product.id;
      state.shownCategories.push('power-tools');
      return {
        message: `I'd recommend our ${product.name}. It's compact, powerful at 350 in-lbs of torque, and comes with a battery, charger, and bag. Great for most DIY and renovation tasks.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: {
            products: [product],
            sceneContext: { setting: 'workshop' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Add to cart', 'Show me more power tools', 'What else do I need?'],
      };
    },
  },
  {
    pattern: /saw|circular saw|cut(ting)? wood|lumber cut/i,
    response: () => {
      const product = findProduct('saw-circular-7in')!;
      state.currentProductId = product.id;
      state.shownCategories.push('power-tools');
      return {
        message: `The ${product.name} is a solid choice — 15 amps, 5,500 RPM, and lightweight. It'll handle framing lumber, plywood, and most decking with ease.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: {
            products: [product],
            sceneContext: { setting: 'workshop' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Add to cart', 'Show me a drill too', 'What blade should I get?'],
      };
    },
  },
  {
    pattern: /paint|painting|interior paint|wall paint|primer/i,
    response: () => {
      const products = [findProduct('paint-interior-gallon')!, findProduct('paint-exterior-gallon')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('paint');
      return {
        message: "Here are our top paint options. The Premium Interior is one-coat with built-in primer — perfect for most rooms. The WeatherGuard is built for exteriors with UV and mildew resistance.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'living-room' as const, generateBackground: false },
          },
        },
        suggestedActions: ['How much paint do I need?', 'What about stain?', 'Show me painting supplies'],
      };
    },
  },
  {
    pattern: /deck|decking|composite deck|deck board/i,
    response: () => {
      const products = [findProduct('decking-composite-16ft')!, findProduct('stain-deck')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('decking');
      return {
        message: "For decking, our composite boards are the way to go — zero maintenance, 25-year warranty, and they look like real wood. If you have an existing wood deck, the Premium Stain & Sealer will protect it for years.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'outdoor' as const, generateBackground: false },
          },
        },
        suggestedActions: ['How many boards for my deck?', 'Show me railing options', 'Compare wood vs composite'],
      };
    },
  },
  {
    pattern: /floor|flooring|vinyl|tile|hardwood|lvp/i,
    response: () => {
      const products = [findProduct('flooring-vinyl-plank')!, findProduct('flooring-tile-porcelain')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('flooring');
      return {
        message: "Two great options: Luxury Vinyl Plank is waterproof, click-lock (no glue needed), and looks like real hardwood. The Porcelain Tile is perfect for bathrooms, kitchens, or high-traffic areas — nearly indestructible.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'living-room' as const, generateBackground: false },
          },
        },
        suggestedActions: ['How much flooring do I need?', 'Can I install LVP myself?', 'Show me tile patterns'],
      };
    },
  },
  {
    pattern: /kitchen|faucet|sink|countertop|cabinet/i,
    response: () => {
      const products = [findProduct('faucet-kitchen-pulldown')!, findProduct('light-recessed-6pk')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('kitchen');
      return {
        message: "For a kitchen upgrade, start with our Touchless Faucet — hands-free with spot-resist finish. Pair it with LED recessed lighting to completely transform the space. Both are DIY-friendly installations.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'kitchen' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Help me plan a kitchen reno', 'Just the faucet', 'What about countertops?'],
      };
    },
  },
  {
    pattern: /bathroom|toilet|vanity|shower|bath/i,
    response: () => {
      const products = [findProduct('toilet-dual-flush')!, findProduct('vanity-36in')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('bathroom');
      return {
        message: "For a bathroom refresh, the WaterSense Toilet saves up to 25% on water usage, and our 36-inch Vanity comes complete with marble top and soft-close drawers. Both are solid upgrades.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'bathroom' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Plan a full bathroom reno', 'Just the vanity', 'Show me shower options'],
      };
    },
  },
  {
    pattern: /light|lighting|led|recessed|pendant|fixture/i,
    response: () => {
      const products = [findProduct('light-recessed-6pk')!, findProduct('light-pendant-farmhouse')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('lighting');
      return {
        message: "Lighting makes a huge difference. Our LED Recessed Lights are canless — no housing needed, and you can adjust the color temperature. The Farmhouse Pendant adds character over a kitchen island or dining table.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'living-room' as const, generateBackground: false },
          },
        },
        suggestedActions: ['How many recessed lights for my room?', 'Show me outdoor lighting', 'Can I install these myself?'],
      };
    },
  },
  {
    pattern: /smart home|smart lock|security|lock|doorbell/i,
    response: () => {
      const products = [findProduct('lock-smartdead')!, findProduct('detector-smoke-co')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('hardware');
      return {
        message: "Start your smart home with essentials: the Smart Deadbolt has fingerprint, keypad, and app control. Pair it with our Smart Smoke & CO Detector for safety alerts on your phone.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'neutral' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Add both to cart', 'Show me more smart home', 'Is it easy to install?'],
      };
    },
  },
  {
    pattern: /outdoor|patio|paver|yard|garden|fence/i,
    response: () => {
      const products = [findProduct('patio-paver-bundle')!, findProduct('decking-composite-16ft')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('outdoor');
      return {
        message: "For outdoor living, our Patio Paver Kit covers 100 sq ft with everything included — pavers, edge restraints, and polymeric sand. If you're thinking bigger, composite decking gives you a low-maintenance elevated space.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'outdoor' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Help me design my patio', 'Compare deck vs patio', 'Show me fence options'],
      };
    },
  },
  // ─── B2B-specific patterns ───────────────────────────────────
  {
    pattern: /lumber|stud|framing|2x4|2x6|plywood|osb|sheathing/i,
    response: () => {
      const products = [findProduct('lumber-2x4-stud-bundle')!, findProduct('plywood-sheathing-osb')!];
      state.lastShownProductIds = products.map((p) => p.id);
      state.shownCategories.push('lumber');
      return {
        message: "Here's our framing essentials. The KD studs come in 100-packs at $389 — volume pricing drops to $329/bundle at 25+. OSB sheathing is $18.50/sheet, down to $16.75 at 50+ sheets. Both available for jobsite delivery.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products,
            sceneContext: { setting: 'warehouse' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Get a quote', 'Schedule delivery', 'Show me insulation too'],
      };
    },
  },
  {
    pattern: /insulation|r-?19|r-?13|batt|blown/i,
    response: () => {
      const product = findProduct('insulation-r19-bundle')!;
      state.currentProductId = product.id;
      state.shownCategories.push('insulation');
      return {
        message: `Our R-19 Fiberglass Batts cover 75 sq ft per bag at $52 — bulk pricing drops to $45/bag at 50+ bags. Perfect for 2x6 walls and floors. Kraft-faced for vapor control.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: {
            products: [product],
            sceneContext: { setting: 'warehouse' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Get a bulk quote', 'Show me R-13 too', 'Add to order'],
      };
    },
  },
  {
    pattern: /roof|shingle|roofing/i,
    response: () => {
      const product = findProduct('roofing-shingle-bundle')!;
      state.currentProductId = product.id;
      state.shownCategories.push('roofing');
      return {
        message: `Architectural shingles at $34/bundle — bulk pricing at $29/bundle for 60+. Class A fire rated, 130 mph wind warranty, algae resistant. Lifetime limited warranty.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: {
            products: [product],
            sceneContext: { setting: 'jobsite' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Calculate bundles for my roof', 'Get a quote', 'Show me underlayment too'],
      };
    },
  },
  {
    pattern: /electric|wire|romex|breaker|outlet|switch/i,
    response: () => {
      const product = findProduct('wire-romex-250ft')!;
      state.currentProductId = product.id;
      state.shownCategories.push('electrical');
      return {
        message: `12/2 NM-B Romex in 250-foot rolls at $89. UL listed, copper conductor with ground. We also carry 14/2 and 10/3 if you need different gauges.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: {
            products: [product],
            sceneContext: { setting: 'warehouse' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Get a quote for all wire needs', 'Show me breaker panels', 'Add to order'],
      };
    },
  },
  {
    pattern: /concrete|cement|footing|slab|post/i,
    response: () => {
      const product = findProduct('concrete-mix-80lb')!;
      state.currentProductId = product.id;
      state.shownCategories.push('concrete');
      return {
        message: `Fast-setting concrete at $6.50/bag — sets in 20-40 minutes, 4,000 PSI strength. Bulk pricing at $5.40/bag for 80+. For posts, just pour dry and add water — no mixing needed.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: {
            products: [product],
            sceneContext: { setting: 'jobsite' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Calculate bags needed', 'Get bulk pricing', 'Show me rebar too'],
      };
    },
  },
  {
    pattern: /drywall|sheetrock|gypsum/i,
    response: () => {
      const product = findProduct('drywall-sheet-50pk')!;
      state.currentProductId = product.id;
      state.shownCategories.push('lumber');
      return {
        message: `Standard 1/2" drywall in 50-sheet bundles at $625 ($12.50/sheet). Fire-resistant core. Volume pricing at $11.75/sheet for 100+. Available for jobsite delivery with crane placement.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: {
            products: [product],
            sceneContext: { setting: 'warehouse' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Get a delivery quote', 'Add joint compound & tape', 'Order now'],
      };
    },
  },
  {
    pattern: /hvac|air condition|mini.?split|heat pump|heating|cooling/i,
    response: () => {
      const product = findProduct('hvac-mini-split')!;
      state.currentProductId = product.id;
      state.shownCategories.push('hvac');
      return {
        message: `Our 12,000 BTU Mini-Split handles up to 550 sq ft with both heating and cooling. SEER2 rating of 20 for energy efficiency. WiFi enabled for app control. Includes both indoor and outdoor units.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: {
            products: [product],
            sceneContext: { setting: 'neutral' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Get installation info', 'Show me larger units', 'Add to cart'],
      };
    },
  },
  {
    pattern: /quote|bid|estimate|pricing|bulk price/i,
    response: () => ({
      message: "I can put together a quote for you. What materials do you need? You can also send me a material list and I'll price it all out with your volume discounts.",
      suggestedActions: ['Quote for framing package', 'Quote for roofing', 'Upload a material list'],
    }),
  },
  {
    pattern: /restock|reorder|running low|last order|order again/i,
    response: () => {
      if (customerCtx?.recentPurchases?.length) {
        const uniqueIds = [...new Set(customerCtx.recentPurchases)];
        const products = uniqueIds
          .map((id) => findProduct(id))
          .filter(Boolean) as NonNullable<ReturnType<typeof findProduct>>[];
        if (products.length) {
          state.lastShownProductIds = products.map((p) => p.id);
          return {
            message: `Here are your recent purchases, ${customerCtx.name}. Want me to set up a reorder?`,
            uiDirective: {
              action: 'SHOW_PRODUCTS' as UIAction,
              payload: {
                products,
                sceneContext: { setting: 'neutral' as const, generateBackground: false },
              },
            },
            suggestedActions: ['Reorder all', 'Modify quantities', 'Show me something different'],
          };
        }
      }
      return {
        message: "I'd be happy to help you restock. What products are you running low on?",
        suggestedActions: ['Paint', 'Lumber', 'Fasteners', 'Show me my order history'],
      };
    },
  },
  {
    pattern: /recommend|what should|suggest|bestseller|popular|what do you/i,
    response: () => {
      const isB2B = customerCtx?.space === 'b2b';
      if (isB2B) {
        const picks = [
          findProduct('lumber-2x4-stud-bundle')!,
          findProduct('insulation-r19-bundle')!,
          findProduct('roofing-shingle-bundle')!,
          findProduct('concrete-mix-80lb')!,
        ];
        state.lastShownProductIds = picks.map((p) => p.id);
        return {
          message: "Here are our most-ordered Pro materials this month. All available with volume pricing and jobsite delivery.",
          uiDirective: {
            action: 'SHOW_PRODUCTS' as UIAction,
            payload: {
              products: picks,
              sceneContext: { setting: 'warehouse' as const, generateBackground: false },
            },
          },
          suggestedActions: ['Get a bulk quote', 'Show me all Pro materials', 'Schedule a delivery'],
        };
      }
      const picks = [
        findProduct('drill-cordless-20v')!,
        findProduct('paint-interior-gallon')!,
        findProduct('flooring-vinyl-plank')!,
        findProduct('faucet-kitchen-pulldown')!,
      ];
      state.lastShownProductIds = picks.map((p) => p.id);
      return {
        message: "Here are our top picks across categories: a versatile drill, our best-selling paint, waterproof vinyl plank flooring, and a touchless kitchen faucet.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: picks,
            sceneContext: { setting: 'neutral' as const, generateBackground: false },
          },
        },
        suggestedActions: ['Show me power tools', 'Help me plan a project', 'Show me what\'s on sale'],
      };
    },
  },
  {
    pattern: /buy|purchase|add to (bag|cart)|get (it|this|both|all|the|them)|order now/i,
    response: () => ({
      message: "Great choice! I'll get that set up for you.",
      uiDirective: {
        action: 'INITIATE_CHECKOUT' as UIAction,
        payload: {
          checkoutData: { products: [], useStoredPayment: true },
        },
      },
      suggestedActions: [],
    }),
  },
  {
    pattern: /how (much|many)|calculate|coverage|measure|square feet|sq ft/i,
    response: () => {
      if (state.shownCategories.includes('paint')) {
        return {
          message: "For paint, measure the height x width of each wall, then subtract doors and windows. One gallon covers about 400 sq ft. For a 12x12 room with 8-foot ceilings, you'd need about 1.5 gallons (2 gallons to be safe).",
          suggestedActions: ['Got it, show me paint', 'What about primer?', 'Help me with another room'],
        };
      }
      if (state.shownCategories.includes('flooring')) {
        return {
          message: "For flooring, multiply room length x width to get square footage. Add 10% for waste and cuts. For example, a 12x15 room = 180 sq ft + 10% = 198 sq ft of flooring needed.",
          suggestedActions: ['Calculate for my room', 'Show me flooring options', 'What about transitions?'],
        };
      }
      return {
        message: "I can help you calculate materials. What project are you working on? Knowing the room dimensions or project scope helps me give you accurate quantities.",
        suggestedActions: ['Paint for a room', 'Flooring for a room', 'Decking for my yard', 'Roofing materials'],
      };
    },
  },
  {
    pattern: /delivery|shipping|jobsite|pick.?up|will.?call/i,
    response: () => {
      const isB2B = customerCtx?.space === 'b2b';
      if (isB2B) {
        return {
          message: "For Pro accounts, we offer free jobsite delivery on orders over $500. We can schedule 48-hour advance deliveries and do staged drops for large projects. Will-call is also available at any branch.",
          suggestedActions: ['Schedule a delivery', 'Check delivery availability', 'Find my nearest branch'],
        };
      }
      return {
        message: "We offer free delivery on orders over $45 for most items. Larger items like appliances and lumber have special delivery options. You can also pick up in-store, often same-day.",
        suggestedActions: ['Check delivery for my order', 'Find a store near me', 'Same-day pickup options'],
      };
    },
  },
  {
    pattern: /project|plan|how to|step.?by.?step|where.?to.?start|beginner/i,
    response: () => {
      return {
        message: "I'd love to help you plan your project! Tell me what you're looking to do and I'll walk you through the steps, tools needed, and materials required. Whether it's a bathroom refresh, kitchen upgrade, or deck build — I've got you covered.",
        suggestedActions: ['Plan a kitchen renovation', 'Plan a bathroom update', 'Build a deck', 'Paint a room'],
      };
    },
  },
  {
    pattern: /spec|specification|detail|dimension|feature/i,
    response: () => {
      if (state.currentProductId) {
        const product = findProduct(state.currentProductId);
        if (product && product.attributes?.specs) {
          return {
            message: `The ${product.name} specs: ${product.attributes.specs.join(', ')}.${product.attributes.warranty ? ` Warranty: ${product.attributes.warranty}.` : ''}`,
            suggestedActions: ['Add to cart', 'Show me alternatives', 'Compare options'],
          };
        }
      }
      return {
        message: "I can look up specs for any product. Which one are you interested in?",
        suggestedActions: ['Power tools', 'Flooring', 'Plumbing fixtures', 'Lighting'],
      };
    },
  },
  {
    pattern: /thank|thanks|bye|goodbye/i,
    response: () => ({
      message: "You're welcome! Good luck with your project. Come back anytime you need advice or supplies!",
      uiDirective: {
        action: 'RESET_SCENE' as UIAction,
        payload: {},
      },
      suggestedActions: [],
    }),
  },
  {
    pattern: /hi|hello|hey|good (morning|afternoon|evening)/i,
    response: () => {
      const welcome = generateWelcomeResponse();
      if (welcome) return welcome;
      return {
        message: "Hello! Welcome to your project advisor. What are you working on today?",
        suggestedActions: ['Help me plan a project', 'Show me power tools', 'I need paint', 'Browse all categories'],
      };
    },
  },
];

export const generateMockResponse = async (message: string): Promise<AgentResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

  if (message === '[WELCOME]') {
    const welcome = generateWelcomeResponse();
    if (welcome) return welcome;
  }

  for (const { pattern, response } of RESPONSE_PATTERNS) {
    if (message.match(pattern)) {
      const result = response();
      const actions = [...(result.suggestedActions || [])];
      const probe = getEnrichmentProbe();
      if (probe && actions.length >= 2 && Math.random() < 0.35) {
        actions[actions.length - 1] = probe;
      }
      return {
        sessionId: 'mock-session',
        message: result.message!,
        uiDirective: result.uiDirective,
        suggestedActions: actions,
        confidence: result.confidence || 0.95,
      };
    }
  }

  return {
    sessionId: 'mock-session',
    message: "I can help with that! I'm knowledgeable about power tools, paint, flooring, plumbing, electrical, outdoor projects, and building materials. What area interests you?",
    suggestedActions: ['Show me power tools', 'Help with paint', 'Flooring options', 'Plan a project'],
    confidence: 0.8,
  };
};
