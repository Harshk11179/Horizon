import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@hooks/useAppStore';
import { getLocation, getAllLocations } from '@services/environmentalDataService';
import HealthScoreGauge from '@components/HealthScore/HealthScoreGauge';
import Panel from '@components/HolographicPanels/Panel';
import LocationSelector from '@components/Dashboard/LocationSelector';

/**
 * Side A / side B wear fixed entity colors (the same dim-cyan/violet
 * pair validated for the trend chart) — color follows the location
 * slot, and "which side is better" is carried by the ▲ BETTER chip,
 * never by color alone.
 */
const SIDE_COLORS = { a: '#00A3C4', b: '#8B5CF6' };

const COMPARE_INDICATORS = [
  { key: 'airQuality', label: 'Air Quality', lowerIsBetter: true },
  { key: 'waterStress', label: 'Water Stress', lowerIsBetter: true },
  { key: 'greenCover', label: 'Green Cover', lowerIsBetter: false },
  { key: 'climateRisk', label: 'Climate Risk', lowerIsBetter: true },
  { key: 'biodiversity', label: 'Biodiversity', lowerIsBetter: false },
];

function BetterChip() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-glow/10 text-emerald-glow font-mono text-[9px] uppercase tracking-wide">
      ▲ better
    </span>
  );
}

function ComparisonRow({ meta, dataA, dataB, delay }) {
  const valueA = dataA?.value;
  const valueB = dataB?.value;
  const hasBoth = valueA != null && valueB != null;

  let winner = null; // 'a' | 'b' | null
  if (hasBoth && valueA !== valueB) {
    const aWins = meta.lowerIsBetter ? valueA < valueB : valueA > valueB;
    winner = aWins ? 'a' : 'b';
  }

  return (
    <Panel from="up" delay={delay} className="!p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Side A: value + right-aligned bar growing leftward */}
        <div className="flex items-center gap-3 justify-end">
          <div className="flex items-center gap-2">
            {winner === 'a' && <BetterChip />}
            <span className="font-mono text-lg text-mist tabular-nums">
              {valueA ?? '—'}
              <span className="text-[10px] text-mist-dim ml-1">{dataA?.unit}</span>
            </span>
          </div>
          <div className="hidden md:block w-full max-w-[180px] h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              className="h-full rounded-full ml-auto"
              style={{ backgroundColor: SIDE_COLORS.a }}
              initial={{ width: 0 }}
              animate={{ width: `${valueA ?? 0}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <div className="text-center min-w-[110px]">
          <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim">
            {meta.label}
          </div>
          <div className="font-mono text-[9px] text-mist-dim/60 mt-0.5">
            {meta.lowerIsBetter ? 'lower is better' : 'higher is better'}
          </div>
        </div>

        {/* Side B: left-aligned bar growing rightward + value */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block w-full max-w-[180px] h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: SIDE_COLORS.b }}
              initial={{ width: 0 }}
              animate={{ width: `${valueB ?? 0}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg text-mist tabular-nums">
              {valueB ?? '—'}
              <span className="text-[10px] text-mist-dim ml-1">{dataB?.unit}</span>
            </span>
            {winner === 'b' && <BetterChip />}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function ComparisonView() {
  const selectedLocationId = useAppStore((state) => state.selectedLocationId);

  // Comparison slots are local state, not the global selection — picking
  // a side B here shouldn't fly the globe camera anywhere or change what
  // the other dashboard views show.
  const [locationIdA, setLocationIdA] = useState(selectedLocationId ?? 'india');
  const [locationIdB, setLocationIdB] = useState(null);
  const [locationA, setLocationA] = useState(null);
  const [locationB, setLocationB] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pick a default side B: the first location that isn't side A.
  useEffect(() => {
    if (locationIdB) return;
    getAllLocations().then((all) => {
      const other = all.find((loc) => loc.id !== locationIdA);
      if (other) setLocationIdB(other.id);
    });
  }, [locationIdA, locationIdB]);

  useEffect(() => {
    if (!locationIdA || !locationIdB) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getLocation(locationIdA), getLocation(locationIdB)]).then(([a, b]) => {
      if (!cancelled) {
        setLocationA(a);
        setLocationB(b);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locationIdA, locationIdB]);

  if (loading || !locationA || !locationB) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-32 pb-20 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="font-display text-2xl text-mist tracking-wide">Location Comparison</h2>
        <p className="font-mono text-xs text-mist-dim mt-1 uppercase tracking-widest">
          Side-by-side environmental indicators
        </p>
      </motion.div>

      {/* Slot selectors + gauges */}
      <div className="grid grid-cols-2 gap-4 md:gap-8 mb-10">
        {[
          { side: 'a', id: locationIdA, setId: setLocationIdA, data: locationA },
          { side: 'b', id: locationIdB, setId: setLocationIdB, data: locationB },
        ].map(({ side, id, setId, data }) => (
          <div key={side} className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: SIDE_COLORS[side] }}
              />
              <LocationSelector activeLocationId={id} onSelect={setId} />
            </div>
            <HealthScoreGauge
              key={`${side}-${id}`}
              score={data.environmentalScore}
              monthlyChange={data.scoreChangeMonthly}
              size="md"
              label={data.name}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {COMPARE_INDICATORS.map((meta, i) => (
          <ComparisonRow
            key={`${meta.key}-${locationIdA}-${locationIdB}`}
            meta={meta}
            dataA={locationA.indicators[meta.key]}
            dataB={locationB.indicators[meta.key]}
            delay={i * 0.07}
          />
        ))}
      </div>

      <p className="mt-8 text-center font-mono text-[10px] text-mist-dim/60 uppercase tracking-widest">
        All indicators indexed 0–100 · bars show raw value
      </p>
    </div>
  );
}
