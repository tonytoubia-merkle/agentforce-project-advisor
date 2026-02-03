import type { Product } from './product';

export type SceneLayout =
  | 'conversation-centered'
  | 'product-hero'
  | 'product-grid'
  | 'checkout';

// Home improvement settings — more utilitarian than beauty
export type KnownSceneSetting =
  | 'neutral'
  | 'workshop'
  | 'kitchen'
  | 'bathroom'
  | 'outdoor'
  | 'garage'
  | 'living-room'
  | 'jobsite'
  | 'warehouse';

export type SceneSetting = KnownSceneSetting | string;

export interface SceneBackground {
  type: 'gradient' | 'image' | 'generative';
  value: string;
  isLoading?: boolean;
}

export interface WelcomeData {
  message: string;
  subtext?: string;
}

export interface SceneState {
  layout: SceneLayout;
  setting: SceneSetting;
  background: SceneBackground;
  chatPosition: 'center' | 'bottom' | 'minimized';
  products: Product[];
  checkoutActive: boolean;
  welcomeActive: boolean;
  welcomeData?: WelcomeData;
  transitionKey: string;
}

export interface SceneTransition {
  from: SceneLayout;
  to: SceneLayout;
  trigger: string;
}
