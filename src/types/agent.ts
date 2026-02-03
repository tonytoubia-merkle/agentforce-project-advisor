import type { Product } from './product';

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  uiDirective?: UIDirective;
}

export type UIAction =
  | 'SHOW_PRODUCT'
  | 'SHOW_PRODUCTS'
  | 'CHANGE_SCENE'
  | 'WELCOME_SCENE'
  | 'INITIATE_CHECKOUT'
  | 'CONFIRM_ORDER'
  | 'RESET_SCENE'
  | 'REQUEST_QUOTE'
  | 'IDENTIFY_CUSTOMER';

export type CaptureType = 'contact_created' | 'meaningful_event' | 'profile_enrichment';

export interface CaptureNotification {
  type: CaptureType;
  label: string;
}

export interface UIDirectivePayload {
  products?: Product[];
  sceneContext?: {
    setting?: string;
    mood?: string;
    generateBackground?: boolean;
    backgroundPrompt?: string;
    editMode?: boolean;
    cmsAssetId?: string;
    cmsTag?: string;
    sceneAssetId?: string;
    imageUrl?: string;
  };
  welcomeMessage?: string;
  welcomeSubtext?: string;
  checkoutData?: {
    products: Product[];
    useStoredPayment?: boolean;
    isQuote?: boolean;
  };
  customerEmail?: string;
  captures?: CaptureNotification[];
}

export interface UIDirective {
  action: UIAction;
  payload: UIDirectivePayload;
}

export interface AgentResponse {
  sessionId: string;
  message: string;
  uiDirective?: UIDirective;
  suggestedActions?: string[];
  confidence?: number;
}
