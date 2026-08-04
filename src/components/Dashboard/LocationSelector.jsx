import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import locationsData from '@data/locations.json';

const LOCATIONS = Object.values(locationsData);

export default function LocationSelector({ activeLocationId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef();
  const inputRef = useRef();

  const active = locationsData[activeLocationId];

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? LOCATIONS.filter(
        (loc) =>
          loc.name.toLowerCase().includes(normalizedQuery) ||
          loc.capital.toLowerCase().includes(normalizedQuery)
      )
    : LOCATIONS;

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus the search field as soon as the dropdown opens, and start each
  // open from a clean query rather than whatever was typed last time.
  useEffect(() => {
    if (open) {
      setQuery('');
      inputRef.current?.focus();
    }
  }, [open]);

  function handleSelect(id) {
    onSelect(id);
    setOpen(false);
  }

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
            className="absolute right-0 mt-2 glass-panel-strong py-2 min-w-[220px] z-20"
          >
            <div className="px-3 pb-2 border-b border-white/[0.06]">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered.length > 0) {
                    handleSelect(filtered[0].id);
                  } else if (e.key === 'Escape') {
                    setOpen(false);
                  }
                }}
                placeholder="Search locations…"
                className="w-full bg-transparent font-body text-sm text-mist placeholder:text-mist-dim/60 outline-none py-1"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-xs font-mono text-mist-dim">No matches</div>
              ) : (
                filtered.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(loc.id)}
                    className={`w-full text-left px-4 py-2 text-sm font-body transition-colors duration-150 ${
                      loc.id === activeLocationId
                        ? 'text-neon-blue bg-neon-blue/5'
                        : 'text-mist-dim hover:text-mist hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="block">{loc.name}</span>
                    <span className="block text-[10px] font-mono text-mist-dim/70 uppercase tracking-wide">
                      {loc.capital}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
