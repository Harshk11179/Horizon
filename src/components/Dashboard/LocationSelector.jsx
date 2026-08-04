import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import locationsData from '@data/locations.json';

const LOCATIONS = Object.values(locationsData);

export default function LocationSelector({ activeLocationId, onSelect }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef();

  const active = locationsData[activeLocationId];

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
        className="glass-panel px-4 py-2 flex items-center gap-2 text-sm font-body text-mist hover:border-neon-blue/30 transition-colors duration-300"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow" />
        {active?.name}
        <span className={`text-mist-dim transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 glass-panel-strong py-2 min-w-[160px] z-20"
          >
            {LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  onSelect(loc.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-body transition-colors duration-150 ${
                  loc.id === activeLocationId
                    ? 'text-neon-blue bg-neon-blue/5'
                    : 'text-mist-dim hover:text-mist hover:bg-white/[0.03]'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
