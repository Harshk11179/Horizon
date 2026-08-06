import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCities } from '@services/environmentalDataService';
import Panel from '@components/HolographicPanels/Panel';

function scoreColor(score) {
  if (score >= 80) return '#00FFA3';
  if (score >= 65) return '#00D9FF';
  return '#FF3B5C';
}

function CityBar({ city, maxScore, index }) {
  const color = scoreColor(city.score);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3"
    >
      <div className="w-24 min-w-[96px]">
        <div className="font-body text-sm text-mist truncate">{city.name}</div>
        <div className="font-mono text-[10px] text-mist-dim/70">{city.population}</div>
      </div>

      <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(city.score / maxScore) * 100}%` }}
          transition={{ delay: index * 0.08 + 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <span className="font-mono text-sm tabular-nums text-mist w-8 text-right" style={{ color }}>
        {city.score}
      </span>
    </motion.div>
  );
}

export default function CityDrillDown({ locationId, locationName }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCities(locationId).then((data) => {
      if (!cancelled) {
        setCities(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [locationId]);

  if (!loading && cities.length === 0) return null;

  const maxScore = cities.length > 0 ? Math.max(...cities.map((c) => c.score)) : 100;

  return (
    <Panel from="up" delay={0.6}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim">
          Regional Breakdown — {locationName}
        </div>
        <span className={`font-mono text-xs text-mist-dim transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="h-16 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
                </div>
              ) : (
                cities.map((city, i) => (
                  <CityBar key={city.id} city={city} maxScore={maxScore} index={i} />
                ))
              )}
            </div>
            <p className="mt-4 font-mono text-[9px] text-mist-dim/50 uppercase tracking-widest">
              City scores are sub-regional estimates · bar scaled to highest city
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}
