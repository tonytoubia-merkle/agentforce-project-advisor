import { motion } from 'framer-motion';
import type { CaptureType } from '@/types/agent';

interface ActivityToastProps {
  type: CaptureType;
  label: string;
  onDone: () => void;
}

const CONFIG: Record<CaptureType, { bg: string; icon: string }> = {
  contact_created: { bg: 'bg-emerald-500/90', icon: '👤' },
  meaningful_event: { bg: 'bg-amber-500/90', icon: '⭐' },
  profile_enrichment: { bg: 'bg-sky-500/90', icon: '📝' },
};

export const ActivityToast: React.FC<ActivityToastProps> = ({ type, label, onDone }) => {
  const { bg, icon } = CONFIG[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={(def) => {
        if (typeof def === 'object' && 'opacity' in def && def.opacity === 0) onDone();
      }}
      className={`${bg} text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 pointer-events-auto`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </motion.div>
  );
};
