import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from '@hooks/useAppStore';
import { getLocation } from '@services/environmentalDataService';

const INDICATOR_LABELS = {
  airQuality: 'Air Quality',
  waterStress: 'Water Stress',
  greenCover: 'Green Cover',
  climateRisk: 'Climate Risk',
  biodiversity: 'Biodiversity',
  temperature: 'Temperature',
  humidity: 'Humidity',
};

const STATUS_COLOR = {
  good: 'text-emerald-glow border-emerald-glow/30',
  low: 'text-emerald-glow border-emerald-glow/30',
  moderate: 'text-neon-blue border-neon-blue/30',
  high: 'text-risk border-risk/30',
};

/**
 * IndicatorCard
 *
 * Each rises independently with a staggered delay (see the parent's
 * transition stagger) — "each indicator should animate upward from the
 * surface of Earth" per the brief. index drives both the stagger delay
 * and a slight horizontal fan-out, so seven cards rising in a row don't
 * look like a single stacked column.
 */
function IndicatorCard({ indicatorKey, data, index, total }) {
  const label = INDICATOR_LABELS[indicatorKey] ?? indicatorKey;
  const statusClass = data.status ? STATUS_COLOR[data.status] ?? STATUS_COLOR.moderate : 'text-mist border-white/20';

  // Fan-out offset: cards nearer the center of the row sit lower/closer,
  // outer cards sit slightly higher — evokes them rising from a curved
  // surface (the globe) rather than a flat line.
  const centerOffset = index - (total - 1) / 2;
  const fanY = Math.abs(centerOffset) * 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      animate={{ opacity: 1, y: fanY, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.3 } }}
      transition={{ delay: index * 0.09, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-panel-strong px-4 py-3 min-w-[108px] border ${statusClass}`}
    >
      <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-1">
        {label}
      </div>
      <div className="font-mono text-xl font-medium tabular-nums">
        {data.value}
        <span className="text-xs ml-0.5 opacity-60">{data.unit}</span>
      </div>
    </motion.div>
  );
}

/**
 * LocationOverlay
 *
 * Only mounts its visible content once scenePhase is LOCATION_FOCUS —
 * gated the same way SelectionRings is, so the DOM panel rise and the
 * 3D ring ceremony play together rather than one preceding the other.
 *
 * Data is fetched via getLocation() (the async service layer), not by
 * importing locations.json directly — this component is genuinely
 * data-driven UI (as opposed to CameraRig's synchronous geometry
 * lookup), so it goes through the seam that will hit the real FastAPI
 * backend later. The brief loading latency this introduces is exactly
 * why the panels animate in with a stagger rather than appearing all
 * at once the instant data resolves — the rise animation comfortably
 * covers the ~220ms simulated fetch.
 */
export default function LocationOverlay() {
  const scenePhase = useAppStore((state) => state.scenePhase);
  const selectedLocationId = useAppStore((state) => state.selectedLocationId);
  const setScenePhase = useAppStore((state) => state.setScenePhase);
  const setActiveDashboardView = useAppStore((state) => state.setActiveDashboardView);
  const clearSelectedLocation = useAppStore((state) => state.clearSelectedLocation);

  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scenePhase !== SCENE_PHASE.LOCATION_FOCUS || !selectedLocationId) {
      setLocationData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getLocation(selectedLocationId).then((data) => {
      if (!cancelled) {
        setLocationData(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [scenePhase, selectedLocationId]);

  const isVisible = scenePhase === SCENE_PHASE.LOCATION_FOCUS && locationData && !loading;

  function handleEnterDashboard() {
    setActiveDashboardView(DASHBOARD_VIEW.MISSION_CONTROL);
    setScenePhase(SCENE_PHASE.DASHBOARD);
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col items-center pb-10 px-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel px-5 py-2 mb-6 pointer-events-auto"
          >
            <span className="font-display text-sm text-mist tracking-wide">
              {locationData.name}
            </span>
            <span className="font-mono text-xs text-mist-dim ml-2">
              {locationData.capital}
            </span>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-8 pointer-events-auto">
            {Object.entries(locationData.indicators).map(([key, data], index, arr) => (
              <IndicatorCard
                key={key}
                indicatorKey={key}
                data={data}
                index={index}
                total={arr.length}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-3 pointer-events-auto"
          >
            <button
              onClick={handleEnterDashboard}
              className="px-6 py-2.5 rounded-full bg-neon-blue/10 border border-neon-blue/40 text-mist text-sm font-display tracking-wide shadow-glow-blue hover:scale-[1.03] transition-transform duration-300"
            >
              View Full Assessment
            </button>
            <button
              onClick={clearSelectedLocation}
              className="px-5 py-2.5 rounded-full border border-white/15 text-mist-dim text-sm font-body hover:text-mist transition-colors duration-300"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
