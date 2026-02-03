import { motion } from 'framer-motion';
import { useScene } from '@/contexts/SceneContext';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openCheckout } = useScene();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="w-40 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer"
    >
      <div className="relative w-full h-28 bg-white/5">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain product-blend p-2"
        />
        {product.attributes?.isPro && (
          <Badge className="absolute top-1.5 left-1.5 bg-amber-600 text-[9px] px-1.5 py-0.5">
            PRO
          </Badge>
        )}
        {product.attributes?.isBulk && !product.attributes?.isPro && (
          <Badge className="absolute top-1.5 left-1.5 bg-blue-600 text-[9px] px-1.5 py-0.5">
            Bulk
          </Badge>
        )}
      </div>

      <div className="px-2.5 pb-2.5 pt-1 text-white">
        <span className="text-white/50 text-[9px] uppercase tracking-wider block truncate">
          {product.brand}
        </span>
        <h3 className="font-medium text-[11px] mt-0.5 line-clamp-2 leading-tight min-h-[2.25rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs font-medium">
            ${(product.price ?? 0).toFixed(2)}
            {product.unitOfMeasure && (
              <span className="text-white/40 text-[9px]">/{product.unitOfMeasure}</span>
            )}
          </span>
          <button
            onClick={() => openCheckout()}
            className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] transition-colors"
          >
            {product.attributes?.isPro ? 'Quote' : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
