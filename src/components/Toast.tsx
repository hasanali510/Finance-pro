import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : toast.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
            }`}
            onClick={() => onRemove(toast.id)}
          >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            <p className="text-sm font-medium text-slate-800 dark:text-white">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
