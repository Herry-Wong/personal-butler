import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';
import type { ToastType } from '../store/useToastStore';

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-700',
};

const iconColorMap: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg ${colorMap[toast.type]}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${iconColorMap[toast.type]}`} />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-0.5 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;