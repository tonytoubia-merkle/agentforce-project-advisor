export type ProductCategory =
  | 'power-tools'
  | 'hand-tools'
  | 'paint'
  | 'lumber'
  | 'plumbing'
  | 'electrical'
  | 'flooring'
  | 'lighting'
  | 'hardware'
  | 'appliances'
  | 'outdoor'
  | 'safety'
  | 'fasteners'
  | 'adhesives'
  | 'insulation'
  | 'hvac'
  | 'roofing'
  | 'concrete'
  | 'decking'
  | 'kitchen'
  | 'bathroom'
  | 'storage';

export interface ProductAttributes {
  projectType?: ('renovation' | 'new-build' | 'repair' | 'diy' | 'professional')[];
  specs?: string[];
  materials?: string[];
  size?: string;
  warranty?: string;
  isPro?: boolean;
  isBulk?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  currency: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  attributes: ProductAttributes;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  personalizationScore?: number;
  /** B2B: unit for bulk pricing */
  unitOfMeasure?: string;
  /** B2B: minimum order quantity */
  minOrderQty?: number;
  /** B2B: bulk discount tiers */
  bulkPricing?: { qty: number; price: number }[];
}
