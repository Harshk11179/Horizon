import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@hooks/useAppStore';

const TONE_CONFIG = {
  risk: { color: '#FF3B5C', glyph: '▼' },
  good: { color: '#00FFA3', glyph: '▲' },
  info: { color: '#00D9FF', glyph: '●' },
};

const AUTO_DISMISS_MS = 5000;

/**
 * ToastHost
 *
 * Renders the store's single transient toast, bottom-center, above
 * everything. One at a time is deliberate — these are ambient notices
 * (score drops on location switch), not a message queue.
 */
export default function ToastHost() {
  const toast = useAppStore((state) => state.toast);
  const clearToast = useAppStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(clearToast, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  const config = TONE_CONFIG[toast?.tone] ?? TONE_CONFIG.info;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel-strong px-4 py-3 flex items-center gap-3 pointer-events-auto max-w-md"
          >
            <span className="text-xs" style={{ color: config.color }} aria-hidden="true">
              {config.glyph}
            </span>
            <span className="font-body text-sm text-mist">{toast.message}</span>
            <button
              onClick={clearToast}
              className="ml-2 text-mist-dim hover:text-mist transition-colors duration-200 font-mono text-xs"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
