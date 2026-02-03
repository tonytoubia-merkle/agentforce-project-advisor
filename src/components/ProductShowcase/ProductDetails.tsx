import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/types/product';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 text-white max-w-sm w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Product Details</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < Math.floor(product.rating ?? 0) ? 'text-yellow-400' : 'text-white/20'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-white/70 text-sm">{product.rating ?? 0} ({(product.reviewCount ?? 0).toLocaleString()} reviews)</span>
      </div>

      {product.attributes?.specs && (
        <div className="mb-4">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Specifications</p>
          <div className="flex flex-wrap gap-1.5">
            {product.attributes.specs.map((spec) => (
              <Badge key={spec} className="bg-white/20 text-white text-xs">{spec}</Badge>
            ))}
          </div>
        </div>
      )}

      {product.attributes?.materials && (
        <div className="mb-4">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Materials</p>
          <ul className="space-y-1">
            {product.attributes.materials.map((mat) => (
              <li key={mat} className="text-white/80 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                {mat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.attributes?.warranty && (
        <div className="mb-4">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Warranty</p>
          <p className="text-white/80 text-sm">{product.attributes.warranty}</p>
        </div>
      )}

      {product.bulkPricing && product.bulkPricing.length > 0 && (
        <div className="mb-4">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Volume Pricing</p>
          <div className="space-y-1">
            {product.bulkPricing.map((tier) => (
              <div key={tier.qty} className="flex justify-between text-sm">
                <span className="text-white/70">{tier.qty}+ {product.unitOfMeasure || 'units'}</span>
                <span className="text-white font-medium">${tier.price.toFixed(2)} each</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {product.attributes?.size && (
        <div className="text-white/60 text-sm">Size: {product.attributes.size}</div>
      )}
    </motion.div>
  );
};
