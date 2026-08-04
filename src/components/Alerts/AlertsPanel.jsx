import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveAlerts } from '@services/environmentalDataService';
import Panel from '@components/HolographicPanels/Panel';

/**
 * Severity is never color alone: each level pairs its color with a
 * distinct glyph and an uppercase text label chip.
 */
const SEVERITY_CONFIG = {
  critical: { color: '#FF3B5C', glyph: '▲', label: 'critical' },
  warning: { color: '#FFB84D', glyph: '◆', label: 'warning' },
  info: { color: '#00D9FF', glyph: '●', label: 'info' },
};

export default function AlertsPanel({ locationId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getActiveAlerts(locationId).then((data) => {
      if (!cancelled) {
        setAlerts(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  return (
    <Panel from="up" delay={0.55}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim">
          Active Alerts
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-glow opacity-60" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-glow" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-glow">
            Live
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const config = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                >
                  <span
                    className="mt-0.5 text-xs leading-none"
                    style={{ color: config.color }}
                    aria-hidden="true"
                  >
                    {config.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-sm text-mist tracking-wide">
                        {alert.title}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wide"
                        style={{ color: config.color, backgroundColor: `${config.color}1A` }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="font-body text-xs text-mist-dim mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-mist-dim/70 whitespace-nowrap mt-0.5">
                    {alert.minutesAgo}m ago
                  </span>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </Panel>
  );
}
