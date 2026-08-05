import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@hooks/useAppStore';

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors duration-150"
      role="switch"
      aria-checked={checked}
    >
      <div>
        <div className="font-body text-sm text-mist">{label}</div>
        <div className="font-mono text-[10px] text-mist-dim/70 mt-0.5">{description}</div>
      </div>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 ${
          checked ? 'bg-neon-blue/25 border-neon-blue/50' : 'bg-white/[0.05] border-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all duration-200 ${
            checked ? 'left-[18px] bg-neon-blue' : 'left-0.5 bg-mist-dim'
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef();

  const temperatureUnit = useAppStore((state) => state.temperatureUnit);
  const setTemperatureUnit = useAppStore((state) => state.setTemperatureUnit);
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  const setReducedMotion = useAppStore((state) => state.setReducedMotion);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`p-2 rounded-full transition-colors duration-300 ${
          open ? 'text-neon-blue bg-neon-blue/10' : 'text-mist-dim hover:text-mist'
        }`}
        aria-label="Settings"
        title="Settings"
      >
        {/* Gear icon — inline SVG keeps it crisp and inherits currentColor */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 glass-panel-strong py-2 w-72 z-50"
          >
            <div className="px-4 pt-1 pb-2 font-mono text-[10px] uppercase tracking-widest text-mist-dim border-b border-white/[0.06]">
              Settings
            </div>

            <div className="flex items-center justify-between gap-4 px-4 py-2.5">
              <div>
                <div className="font-body text-sm text-mist">Temperature unit</div>
                <div className="font-mono text-[10px] text-mist-dim/70 mt-0.5">
                  Applies to all readouts
                </div>
              </div>
              <div className="flex rounded-full border border-white/10 overflow-hidden">
                {['C', 'F'].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setTemperatureUnit(unit)}
                    className={`px-3 py-1 font-mono text-xs transition-colors duration-200 ${
                      temperatureUnit === unit
                        ? 'bg-neon-blue/15 text-neon-blue'
                        : 'text-mist-dim hover:text-mist'
                    }`}
                  >
                    °{unit}
                  </button>
                ))}
              </div>
            </div>

            <ToggleRow
              label="Reduced motion"
              description="Disables decorative particle effects"
              checked={reducedMotion}
              onChange={setReducedMotion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
