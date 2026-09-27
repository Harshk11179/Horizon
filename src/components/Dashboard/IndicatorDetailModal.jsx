import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllLocations } from '@services/environmentalDataService';
import { useAppStore, USER_ROLE } from '@hooks/useAppStore';

const INDICATOR_INFO = {
  airQuality: {
    label: 'Air Quality Index',
    unit: 'AQI',
    lowerIsBetter: true,
    description:
      'The Air Quality Index measures the concentration of pollutants — primarily PM2.5, PM10, NO₂, SO₂, and ground-level ozone — in the atmosphere. Lower values indicate cleaner air and lower health risk for residents and ecosystems.',
    methodology:
      'Composite index derived from ground-station PM2.5/PM10 concentrations, NO₂ and SO₂ spectrophotometry, and ozone photometry, normalized against WHO reference bands and averaged over a rolling 24-hour window.',
    scale: [
      { max: 30, label: 'Good', color: '#00FFA3' },
      { max: 60, label: 'Moderate', color: '#00D9FF' },
      { max: 100, label: 'Unhealthy', color: '#FF3B5C' },
    ],
  },
  waterStress: {
    label: 'Water Stress Index',
    unit: 'index',
    lowerIsBetter: true,
    description:
      'Water stress measures how much of the available freshwater is withdrawn for human use relative to natural replenishment. High values signal that demand is outpacing sustainable supply, increasing the risk of shortages and aquifer depletion.',
    methodology:
      'Ratio of total freshwater withdrawal (agricultural, industrial, municipal) to renewable supply, modeled from basin-level hydrological data and reservoir telemetry, updated on a monthly cadence.',
    scale: [
      { max: 25, label: 'Low', color: '#00FFA3' },
      { max: 50, label: 'Moderate', color: '#00D9FF' },
      { max: 100, label: 'High', color: '#FF3B5C' },
    ],
  },
  greenCover: {
    label: 'Green Cover',
    unit: '%',
    lowerIsBetter: false,
    description:
      'Green cover represents the percentage of land area occupied by vegetation — forests, shrubland, grassland, and urban greenery. Higher values support biodiversity, absorb CO₂, regulate temperature, and reduce flood risk.',
    methodology:
      'Estimated via multispectral satellite imagery (NDVI thresholding) cross-referenced with land-use registries, classified into vegetation categories and expressed as a share of total land area.',
    scale: [
      { max: 30, label: 'Low', color: '#FF3B5C' },
      { max: 50, label: 'Moderate', color: '#00D9FF' },
      { max: 100, label: 'High', color: '#00FFA3' },
    ],
  },
  climateRisk: {
    label: 'Climate Risk Index',
    unit: 'index',
    lowerIsBetter: true,
    description:
      'A composite index of exposure to extreme weather events — heatwaves, flooding, droughts, and storms — weighted by the region\'s projected frequency and severity under current emissions trajectories. Lower values indicate greater resilience.',
    methodology:
      'Blends historical hazard frequency, climate-model projections (RCP-weighted), and regional exposure/vulnerability factors such as infrastructure density and elevation, recalculated quarterly.',
    scale: [
      { max: 30, label: 'Low', color: '#00FFA3' },
      { max: 60, label: 'Elevated', color: '#00D9FF' },
      { max: 100, label: 'High', color: '#FF3B5C' },
    ],
  },
  biodiversity: {
    label: 'Biodiversity Index',
    unit: 'index',
    lowerIsBetter: false,
    description:
      'A species richness and habitat-integrity index derived from observed and modelled species counts for the region. Higher values indicate a broader and healthier mix of flora and fauna, a signal of ecosystem stability and resilience.',
    methodology:
      'Combines field survey counts, camera-trap and eDNA sampling, and habitat-connectivity modeling into a normalized richness score, benchmarked against regional historical baselines.',
    scale: [
      { max: 40, label: 'Low', color: '#FF3B5C' },
      { max: 65, label: 'Moderate', color: '#00D9FF' },
      { max: 100, label: 'High', color: '#00FFA3' },
    ],
  },
};

function scaleColor(info, value) {
  if (!info) return '#00D9FF';
  for (const band of info.scale) {
    if (value <= band.max) return band.color;
  }
  return info.scale[info.scale.length - 1].color;
}

function CrossLocationChart({ indicatorKey, currentLocationId, info }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getAllLocations().then((all) => {
      if (!cancelled) {
        const sorted = [...all].sort((a, b) => {
          const av = a.indicators[indicatorKey]?.value ?? 0;
          const bv = b.indicators[indicatorKey]?.value ?? 0;
          return info.lowerIsBetter ? av - bv : bv - av;
        });
        setRows(sorted);
      }
    });
    return () => { cancelled = true; };
  }, [indicatorKey, info.lowerIsBetter]);

  if (rows.length === 0) return null;

  const values = rows.map((r) => r.indicators[indicatorKey]?.value ?? 0);
  const maxVal = Math.max(...values) || 1;

  return (
    <div className="space-y-2">
      {rows.map((loc, i) => {
        const val = loc.indicators[indicatorKey]?.value ?? 0;
        const color = scaleColor(info, val);
        const isCurrent = loc.id === currentLocationId;
        return (
          <motion.div
            key={loc.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 ${isCurrent ? 'opacity-100' : 'opacity-70'}`}
          >
            <span className={`font-body text-xs w-24 truncate ${isCurrent ? 'text-mist' : 'text-mist-dim'}`}>
              {loc.name}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${(val / maxVal) * 100}%` }}
                transition={{ delay: i * 0.04 + 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-mist-dim w-10 text-right">
              {val}
            </span>
            {isCurrent && (
              <span className="font-mono text-[8px] uppercase text-neon-blue tracking-wide">◀ you</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function IndicatorDetailModal({ indicatorKey, locationId, data, rawData, onClose }) {
  const info = INDICATOR_INFO[indicatorKey];
  const userRole = useAppStore((state) => state.userRole);
  const isEngineer = userRole === USER_ROLE.ENGINEER;

  // Dismiss on Escape or backdrop click
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-void-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-panel-strong w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 font-mono text-mist-dim hover:text-mist transition-colors duration-200"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-mist-dim mb-1">
              Indicator Detail
            </div>
            <h3 className="font-display text-xl text-mist tracking-wide">
              {info?.label ?? indicatorKey}
            </h3>
          </div>

          {/* Current value */}
          <div className="flex items-end gap-3 mb-6">
            <span
              className="font-mono text-5xl font-medium tabular-nums"
              style={{ color: scaleColor(info, data?.value ?? 0) }}
            >
              {data?.value ?? '—'}
            </span>
            <span className="font-mono text-base text-mist-dim mb-2">{data?.unit}</span>
            {data?.status && (
              <span
                className="mb-2 px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wide"
                style={{
                  color: scaleColor(info, data.value),
                  backgroundColor: `${scaleColor(info, data.value)}1A`,
                }}
              >
                {data.status}
              </span>
            )}
          </div>

          {/* Scale bands */}
          {info && (
            <div className="flex gap-2 mb-6">
              {info.scale.map((band) => (
                <div
                  key={band.label}
                  className="flex-1 rounded px-2 py-1.5 text-center"
                  style={{ backgroundColor: `${band.color}18`, border: `1px solid ${band.color}30` }}
                >
                  <div className="font-mono text-[9px] uppercase tracking-wide" style={{ color: band.color }}>
                    {band.label}
                  </div>
                  <div className="font-mono text-[9px] text-mist-dim/70 mt-0.5">
                    {info.lowerIsBetter ? `≤ ${band.max}` : `≥ ${100 - band.max}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {info && (
            <p className="font-body text-sm text-mist-dim leading-relaxed mb-8">
              {info.description}
            </p>
          )}

          {/* Engineer mode: methodology + raw sensor readings */}
          {isEngineer && info?.methodology && (
            <div className="mb-8 rounded border border-neon-blue/20 bg-neon-blue/[0.04] p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon-blue mb-2">
                ⚙ Methodology
              </div>
              <p className="font-body text-xs text-mist-dim leading-relaxed mb-4">
                {info.methodology}
              </p>
              {rawData && (
                <div className="flex gap-6 pt-3 border-t border-white/[0.06]">
                  {rawData.temperature && (
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wide text-mist-dim/70">
                        Raw temperature
                      </div>
                      <div className="font-mono text-sm text-mist tabular-nums">
                        {rawData.temperature.value}{rawData.temperature.unit}
                      </div>
                    </div>
                  )}
                  {rawData.humidity && (
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wide text-mist-dim/70">
                        Raw humidity
                      </div>
                      <div className="font-mono text-sm text-mist tabular-nums">
                        {rawData.humidity.value}{rawData.humidity.unit}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cross-location comparison */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-4">
              All Locations — {info?.lowerIsBetter ? 'best (lowest) first' : 'best (highest) first'}
            </div>
            {info && (
              <CrossLocationChart
                indicatorKey={indicatorKey}
                currentLocationId={locationId}
                info={info}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
