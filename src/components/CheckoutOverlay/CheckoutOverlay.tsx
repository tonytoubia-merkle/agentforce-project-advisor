import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScene } from '@/contexts/SceneContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { Button } from '@/components/ui/Button';

type CheckoutState = 'idle' | 'processing' | 'confirmed';

export const CheckoutOverlay: React.FC = () => {
  const { scene, closeCheckout } = useScene();
  const { customer } = useCustomer();
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [orderId] = useState(() => `${customer?.space === 'b2b' ? 'PO' : 'ORD'}-${Date.now().toString(36).toUpperCase()}`);
  const [poNumber, setPoNumber] = useState('');

  const isB2B = customer?.space === 'b2b';
  const products = scene.products;
  const total = products.reduce((sum, p) => sum + (p.price ?? 0), 0);
  const defaultPayment = customer?.savedPaymentMethods.find((p) => p.isDefault);
  const defaultAddress = customer?.shippingAddresses.find((a) => a.isDefault);

  const estimatedDelivery = new Date(Date.now() + (isB2B ? 3 : 5) * 24 * 60 * 60 * 1000).toLocaleDateString(
    'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' }
  );

  const handleConfirm = () => {
    setCheckoutState('processing');
    setTimeout(() => {
      setCheckoutState('confirmed');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={checkoutState === 'idle' ? closeCheckout : undefined}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-white rounded-t-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

        {checkoutState === 'confirmed' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {isB2B ? 'Quote Submitted!' : 'Order Confirmed!'}
            </h2>
            <p className="text-gray-500 mb-1">{isB2B ? 'Quote' : 'Order'} {orderId}</p>
            {poNumber && <p className="text-gray-500 mb-1">PO: {poNumber}</p>}
            <p className="text-gray-500 mb-6">
              {isB2B ? `Estimated delivery: ${estimatedDelivery}` : `Estimated delivery: ${estimatedDelivery}`}
            </p>
            <div className="space-y-2 mb-6">
              {products.map((product) => (
                <p key={product.id} className="text-gray-700 text-sm">{product.name}</p>
              ))}
              <p className="font-semibold text-gray-900 mt-2">Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <Button onClick={closeCheckout} size="lg" className="w-full bg-brand-600 hover:bg-brand-700 text-white">
              Done
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {isB2B ? 'Request Quote' : 'Quick Checkout'}
            </h2>

            <div className="space-y-4 mb-6">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-contain bg-gray-100"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-gray-500 text-sm">{product.brand}</p>
                  </div>
                  <span className="font-medium">
                    ${(product.price ?? 0).toFixed(2)}
                    {product.unitOfMeasure && <span className="text-gray-400 text-sm">/{product.unitOfMeasure}</span>}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {isB2B && (
              <div className="mb-4">
                <label className="text-gray-600 text-sm block mb-1">PO Number (optional)</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="Enter PO number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            {defaultPayment && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Payment</span>
                <span className="font-medium">
                  {defaultPayment.type === 'net-30' ? 'Net-30 Terms' : `${defaultPayment.brand?.toUpperCase()} \u2022\u2022\u2022\u2022 ${defaultPayment.last4}`}
                </span>
              </div>
            )}

            {defaultAddress && (
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-600">{isB2B ? 'Deliver to' : 'Ship to'}</span>
                <span className="font-medium text-right">
                  {defaultAddress.name}<br />
                  <span className="text-gray-500 font-normal">{defaultAddress.city}, {defaultAddress.state}</span>
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-semibold">Total</span>
              <span className="text-xl font-semibold">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={checkoutState === 'processing'}
              size="lg"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white"
            >
              {checkoutState === 'processing' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isB2B ? 'Submit Quote Request' : 'Confirm Purchase'
              )}
            </Button>

            <button
              onClick={closeCheckout}
              disabled={checkoutState === 'processing'}
              className="w-full mt-3 py-3 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
