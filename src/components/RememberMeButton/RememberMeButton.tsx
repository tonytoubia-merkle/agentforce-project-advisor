import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '@/contexts/CustomerContext';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/utils/cn';

interface RememberMeFormData {
  name: string;
  email: string;
}

export const RememberMeButton: React.FC = () => {
  const { customer } = useCustomer();
  const { sendMessage } = useConversation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<RememberMeFormData>({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show for anonymous users
  const isAnonymous = !customer || customer.merkuryIdentity?.identityTier === 'anonymous';
  if (!isAnonymous) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    setIsSubmitting(true);
    try {
      // Inject a natural message into the conversation to trigger IdentityCapture topic
      await sendMessage(`My name is ${formData.name.trim()} and my email is ${formData.email.trim()}`);
      setIsModalOpen(false);
      setFormData({ name: '', email: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setFormData({ name: '', email: '' });
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-white/10 hover:bg-white/20 backdrop-blur-sm',
          'text-white/80 text-sm font-medium',
          'border border-white/20 transition-colors'
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Remember me
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div
                className={cn(
                  'w-full max-w-sm bg-slate-800 rounded-2xl shadow-xl',
                  'border border-white/10 overflow-hidden'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                  <h2 className="text-xl font-semibold text-white">Get personalized help</h2>
                  <p className="text-white/60 text-sm mt-1">
                    Share your info so we can remember your preferences and project history.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1.5">
                        Your name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                        disabled={isSubmitting}
                        className={cn(
                          'w-full px-4 py-2.5 rounded-lg',
                          'bg-white/10 border border-white/20',
                          'text-white placeholder-white/40',
                          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                          'disabled:opacity-50'
                        )}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1.5">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                        className={cn(
                          'w-full px-4 py-2.5 rounded-lg',
                          'bg-white/10 border border-white/20',
                          'text-white placeholder-white/40',
                          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                          'disabled:opacity-50'
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className={cn(
                        'flex-1 px-4 py-2.5 rounded-lg',
                        'bg-white/10 hover:bg-white/20 text-white',
                        'transition-colors disabled:opacity-50'
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
                      className={cn(
                        'flex-1 px-4 py-2.5 rounded-lg',
                        'bg-brand-600 hover:bg-brand-700 text-white font-medium',
                        'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isSubmitting ? 'Saving...' : 'Continue'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
