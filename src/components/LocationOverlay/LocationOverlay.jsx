import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from '@hooks/useAppStore';
import { getLocation } from '@services/environmentalDataService';
import { formatTemperature } from '@utils/formatTemperature';

const INDICATOR_LABELS = {
  airQuality:  'Air Quality',
  waterStress: 'Water Stress',
  greenCover:  'Green Cover',
  climateRisk: 'Climate Risk',
  biodiversity:'Biodiversity',
  temperature: 'Temperature',
  humidity:    'Humidity',
};

const STATUS_STYLES = {
  good:     { color: '#00F5A0', bg: 'rgba(0,245,160,0.08)',  border: 'rgba(0,245,160,0.25)' },
  low:      { color: '#00F5A0', bg: 'rgba(0,245,160,0.08)',  border: 'rgba(0,245,160,0.25)' },
  moderate: { color: '#00D4FF', bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.25)' },
  high:     { color: '#FF3B5C', bg: 'rgba(255,59,92,0.08)',  border: 'rgba(255,59,92,0.25)' },
};

function IndicatorCard({ indicatorKey, data, index, total }) {
  const temperatureUnit = useAppStore((s) => s.temperatureUnit);
  const label   = INDICATOR_LABELS[indicatorKey] ?? indicatorKey;
  const styles  = data.status ? STATUS_STYLES[data.status] ?? STATUS_STYLES.moderate : { color: '#9AB3CC', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)' };
  const display = indicatorKey === 'temperature'
    ? formatTemperature(data.value, temperatureUnit)
    : { value: data.value, unit: data.unit };

  const centerOffset = index - (total - 1) / 2;
  const fanY = Math.abs(centerOffset) * 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 70, scale: 0.82 }}
      animate={{ opacity: 1, y: fanY, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.88, transition: { duration: 0.3 } }}
      transition={{ delay: index * 0.08, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden"
      style={{
        minWidth: 112,
        padding: '12px 16px',
        borderRadius: 16,
        background: `linear-gradient(135deg,${styles.bg},rgba(7,12,24,0.85))`,
        border: `1px solid ${styles.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Shimmer highlight */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 60%)',
        }}
      />
      <div
        className="font-mono text-[9px] uppercase tracking-[0.15em] mb-1.5"
        style={{ color: 'rgba(154,179,204,0.7)' }}
      >
        {label}
      </div>
      <div
        className="font-mono text-xl font-medium tabular-nums"
        style={{ color: styles.color }}
      >
        {display.value}
        <span className="text-xs ml-0.5 opacity-60">{display.unit}</span>
      </div>
    </motion.div>
  );
}

export default function LocationOverlay() {
  const scenePhase          = useAppStore((s) => s.scenePhase);
  const selectedLocationId  = useAppStore((s) => s.selectedLocationId);
  const setScenePhase       = useAppStore((s) => s.setScenePhase);
  const setActiveDashboard  = useAppStore((s) => s.setActiveDashboardView);
  const clearSelected       = useAppStore((s) => s.clearSelectedLocation);

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
      if (!cancelled) { setLocationData(data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [scenePhase, selectedLocationId]);

  const isVisible = scenePhase === SCENE_PHASE.LOCATION_FOCUS && locationData && !loading;

  function handleEnterDashboard() {
    setActiveDashboard(DASHBOARD_VIEW.MISSION_CONTROL);
    setScenePhase(SCENE_PHASE.DASHBOARD);
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col items-center pb-10 px-6 pointer-events-none">

          {/* Location name chip */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 pointer-events-auto flex items-center gap-3"
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              background: 'linear-gradient(135deg,rgba(11,17,32,0.88),rgba(7,12,24,0.95))',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,212,255,0.22)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4),0 0 20px rgba(0,212,255,0.1)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow animate-pulse-subtle" style={{ boxShadow: '0 0 6px rgba(0,245,160,0.8)' }} />
            <span className="font-display text-sm text-mist tracking-wide">{locationData.name}</span>
            <span className="font-mono text-xs text-mist-subtle">•</span>
            <span className="font-mono text-xs text-mist-dim">{locationData.capital}</span>
            <span
              className="font-mono text-xs font-medium tabular-nums"
              style={{ color: locationData.environmentalScore >= 75 ? '#00F5A0' : locationData.environmentalScore >= 50 ? '#00D4FF' : '#FF3B5C' }}
            >
              {locationData.environmentalScore}
            </span>
          </motion.div>

          {/* Indicator cards */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8 pointer-events-auto">
            {Object.entries(locationData.indicators).map(([key, data], i, arr) => (
              <IndicatorCard key={key} indicatorKey={key} data={data} index={i} total={arr.length} />
            ))}
          </div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 pointer-events-auto"
          >
            <button
              onClick={handleEnterDashboard}
              className="relative overflow-hidden px-7 py-2.5 rounded-full font-display text-sm tracking-wide text-mist group"
              style={{
                background: 'linear-gradient(135deg,rgba(0,212,255,0.14),rgba(79,142,255,0.10))',
                border: '1px solid rgba(0,212,255,0.4)',
                boxShadow: '0 0 24px rgba(0,212,255,0.25)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(0,212,255,0.25)'; e.currentTarget.style.transform = ''; }}
            >
              View Full Assessment
            </button>
            <button
              onClick={clearSelected}
              className="px-6 py-2.5 rounded-full font-body text-sm text-mist-dim hover:text-mist transition-colors duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
