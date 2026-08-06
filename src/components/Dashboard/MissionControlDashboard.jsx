import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@hooks/useAppStore';
import { getLocation } from '@services/environmentalDataService';
import { formatTemperature } from '@utils/formatTemperature';
import HealthScoreGauge from '@components/HealthScore/HealthScoreGauge';
import Panel from '@components/HolographicPanels/Panel';
import Timeline from '@components/Timeline/Timeline';
import AlertsPanel from '@components/Alerts/AlertsPanel';
import CityDrillDown from './CityDrillDown';
import IndicatorDetailModal from './IndicatorDetailModal';
import LocationSelector from './LocationSelector';

const INDICATOR_META = [
  { key: 'airQuality', label: 'Air Quality', from: 'left' },
  { key: 'waterStress', label: 'Water Stress', from: 'up' },
  { key: 'greenCover', label: 'Green Cover', from: 'right' },
  { key: 'climateRisk', label: 'Climate Risk', from: 'left' },
  { key: 'biodiversity', label: 'Biodiversity', from: 'down' },
];

function toneForStatus(status) {
  if (status === 'good' || status === 'low') return 'good';
  if (status === 'high') return 'risk';
  return 'default';
}

function IndicatorPanel({ meta, data, delay, onClick }) {
  const tone = toneForStatus(data?.status);
  return (
    <Panel from={meta.from} delay={delay} tone={tone} as={motion.button} className="text-left w-full cursor-pointer" onClick={onClick}>
      <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-2">
        {meta.label}
      </div>
      <div className="flex items-end justify-between">
        <span className="font-mono text-3xl font-medium text-mist tabular-nums">
          {data?.value ?? '—'}
        </span>
        <span className="font-mono text-xs text-mist-dim mb-1">{data?.unit}</span>
      </div>
      {data?.status && (
        <div
          className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide ${
            tone === 'good'
              ? 'bg-emerald-glow/10 text-emerald-glow'
              : tone === 'risk'
                ? 'bg-risk/10 text-risk'
                : 'bg-neon-blue/10 text-neon-blue'
          }`}
        >
          {data.status}
        </div>
      )}
      <div className="mt-3 font-mono text-[9px] uppercase tracking-widest text-mist-dim/60">
        Click for details →
      </div>
    </Panel>
  );
}

/**
 * MissionControlDashboard
 *
 * "Clicking India should demonstrate the interaction" (brief, under
 * HOLOGRAPHIC OVERLAY) — read as the intended default focus, not a
 * one-time-only instruction. If the user enters the dashboard directly
 * via "Enter Dashboard" (skipping marker selection entirely), this
 * defaults to India rather than showing an empty state, so the
 * dashboard is never blank on first entry regardless of the path taken
 * to reach it. LocationSelector (below) lets them switch from there.
 */
// Session-scoped memory of which locations already raised a score-drop
// toast — module-level on purpose, so re-mounting the dashboard (tab
// switches, dashboard exit/re-entry) doesn't repeat old notifications.
const notifiedScoreDrops = new Set();

export default function MissionControlDashboard() {
  const selectedLocationId = useAppStore((state) => state.selectedLocationId);
  const setSelectedLocationId = useAppStore((state) => state.setSelectedLocationId);
  const showToast = useAppStore((state) => state.showToast);
  const temperatureUnit = useAppStore((state) => state.temperatureUnit);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Non-null while the trend panel's time-lapse is replaying history:
  // the gauge shows that month's score instead of the live one.
  const [timelapseFrame, setTimelapseFrame] = useState(null);
  // Which indicator panel was clicked (opens the detail modal).
  const [detailModal, setDetailModal] = useState(null);

  const activeLocationId = selectedLocationId ?? 'india';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLocation(activeLocationId).then((data) => {
      if (!cancelled) {
        setLocationData(data);
        setLoading(false);
        if (data && data.scoreChangeMonthly < 0 && !notifiedScoreDrops.has(data.id)) {
          notifiedScoreDrops.add(data.id);
          showToast({
            tone: 'risk',
            message: `${data.name}'s environmental score fell ${Math.abs(data.scoreChangeMonthly)} point${Math.abs(data.scoreChangeMonthly) === 1 ? '' : 's'} this month.`,
          });
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocationId, showToast]);

  if (loading || !locationData) {
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
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h2 className="font-display text-2xl text-mist tracking-wide">Mission Control</h2>
          <p className="font-mono text-xs text-mist-dim mt-1 uppercase tracking-widest">
            {locationData.name} — Live Assessment
          </p>
        </div>
        <LocationSelector
          activeLocationId={activeLocationId}
          onSelect={setSelectedLocationId}
          hotkey
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="md:col-span-1 flex flex-col items-center gap-3 pt-4">
          <HealthScoreGauge
            score={timelapseFrame ? timelapseFrame.score : locationData.environmentalScore}
            monthlyChange={timelapseFrame ? 0 : locationData.scoreChangeMonthly}
            size="lg"
            label={
              timelapseFrame
                ? `Score — ${timelapseFrame.month} (time-lapse)`
                : 'Environmental Score'
            }
          />
          {timelapseFrame && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-glow animate-pulse">
              ● Replaying history
            </span>
          )}
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {INDICATOR_META.slice(0, 4).map((meta, i) => (
            <IndicatorPanel
              key={meta.key}
              meta={meta}
              data={locationData.indicators[meta.key]}
              delay={i * 0.08}
              onClick={() => setDetailModal({ key: meta.key, data: locationData.indicators[meta.key] })}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <IndicatorPanel
          meta={INDICATOR_META[4]}
          data={locationData.indicators.biodiversity}
          delay={0.32}
          onClick={() => setDetailModal({ key: 'biodiversity', data: locationData.indicators.biodiversity })}
        />
        <Panel from="up" delay={0.4} className="md:col-span-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-1">
            Temperature / Humidity
          </div>
          <div className="flex items-center gap-8 mt-2">
            <div>
              {(() => {
                const temp = formatTemperature(
                  locationData.indicators.temperature.value,
                  temperatureUnit
                );
                return (
                  <>
                    <span className="font-mono text-2xl text-mist tabular-nums">{temp.value}</span>
                    <span className="font-mono text-sm text-mist-dim ml-1">{temp.unit}</span>
                  </>
                );
              })()}
            </div>
            <div>
              <span className="font-mono text-2xl text-mist tabular-nums">
                {locationData.indicators.humidity.value}
              </span>
              <span className="font-mono text-sm text-mist-dim ml-1">
                {locationData.indicators.humidity.unit}
              </span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel from="up" delay={0.5} className="mb-10">
        <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-4">
          12-Month Environmental Trend
        </div>
        <Timeline locationId={activeLocationId} onTimelapseFrame={setTimelapseFrame} />
      </Panel>

      <AlertsPanel locationId={activeLocationId} />

      <div className="mt-6">
        <CityDrillDown locationId={activeLocationId} locationName={locationData.name} />
      </div>

      {detailModal && (
        <IndicatorDetailModal
          indicatorKey={detailModal.key}
          locationId={activeLocationId}
          data={detailModal.data}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
}
