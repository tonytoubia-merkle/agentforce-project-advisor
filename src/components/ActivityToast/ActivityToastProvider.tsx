import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ActivityToast } from './ActivityToast';
import type { CaptureNotification } from '@/types/agent';

interface ToastItem extends CaptureNotification {
  id: number;
}

interface ActivityToastContextValue {
  showCapture: (notification: CaptureNotification) => void;
}

const ActivityToastContext = createContext<ActivityToastContextValue | null>(null);

export const ActivityToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showCapture = useCallback((notification: CaptureNotification) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { ...notification, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ActivityToastContext.Provider value={{ showCapture }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ActivityToast
              key={toast.id}
              type={toast.type}
              label={toast.label}
              onDone={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ActivityToastContext.Provider>
  );
};

export const useActivityToast = (): ActivityToastContextValue => {
  const context = useContext(ActivityToastContext);
  if (!context) {
    throw new Error('useActivityToast must be used within ActivityToastProvider');
  }
  return context;
};
