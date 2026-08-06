import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@hooks/useAppStore';
import { getLocation, getSuggestions } from '@services/environmentalDataService';
import { getAdoptedActions, toggleAction, computeProgress } from '@utils/ecoActionsTracker';
import HealthScoreGauge from '@components/HealthScore/HealthScoreGauge';
import Panel from '@components/HolographicPanels/Panel';
import LocationSelector from '@components/Dashboard/LocationSelector';

const INDICATOR_LABELS = {
  airQuality: 'Air Quality',
  waterStress: 'Water Availability',
  greenCover: 'Green Cover',
  climateRisk: 'Climate Risk',
  biodiversity: 'Biodiversity',
};

/**
 * CitizenView
 *
 * "Top Environmental Challenges" — read as the indicators most in need
 * of attention for this location, i.e. the ones with 'moderate' or
 * 'high' status, ranked worst-first. This is computed client-side from
 * the same indicator data MissionControl uses, rather than being a
 * separate hardcoded list, so the two views can never disagree about
 * which indicators are concerning for a given location.
 */
function getTopChallenges(indicators) {
  const statusWeight = { high: 2, moderate: 1, good: 0, low: 0 };
  return Object.entries(indicators)
    .filter(([key]) => INDICATOR_LABELS[key])
    .map(([key, data]) => ({ key, ...data, weight: statusWeight[data.status] ?? 0 }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}

export default function CitizenView() {
  const selectedLocationId = useAppStore((state) => state.selectedLocationId);
  const setSelectedLocationId = useAppStore((state) => state.setSelectedLocationId);
  const [locationData, setLocationData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adoptedActions, setAdoptedActions] = useState(() => getAdoptedActions());

  const activeLocationId = selectedLocationId ?? 'india';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getLocation(activeLocationId), getSuggestions(activeLocationId)]).then(
      ([location, suggestionList]) => {
        if (!cancelled) {
          setLocationData(location);
          setSuggestions(suggestionList);
          setLoading(false);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [activeLocationId]);

  if (loading || !locationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
      </div>
    );
  }

  const challenges = getTopChallenges(locationData.indicators);
  const progress = computeProgress(adoptedActions.size);

  function handleToggle(actionId) {
    setAdoptedActions(toggleAction(actionId));
  }

  return (
    <div className="min-h-screen px-6 pt-32 pb-20 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h2 className="font-display text-2xl text-mist tracking-wide">Your Environment</h2>
          <p className="font-mono text-xs text-mist-dim mt-1 uppercase tracking-widest">
            {locationData.name}
          </p>
        </div>
        <LocationSelector activeLocationId={activeLocationId} onSelect={setSelectedLocationId} hotkey />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 items-center">
        <Panel from="left" delay={0} className="flex flex-col items-center py-8">
          <HealthScoreGauge
            score={locationData.environmentalScore}
            monthlyChange={locationData.scoreChangeMonthly}
            size="lg"
          />
          <p className="mt-4 text-center text-sm text-mist-dim max-w-xs">
            {locationData.scoreChangeMonthly < 0
              ? 'Your area\u2019s environmental conditions have declined slightly this month.'
              : locationData.scoreChangeMonthly > 0
                ? 'Your area\u2019s environmental conditions have improved this month.'
                : 'Your area\u2019s environmental conditions have held steady this month.'}
          </p>
        </Panel>

        <Panel from="right" delay={0.1}>
          <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-4">
            Top Environmental Challenges
          </div>
          <div className="flex flex-col gap-3">
            {challenges.map((c) => (
              <div key={c.key} className="flex items-center justify-between">
                <span className="text-sm font-body text-mist">
                  {INDICATOR_LABELS[c.key]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm tabular-nums text-mist-dim">
                    {c.value}
                    {c.unit}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      c.status === 'high'
                        ? 'bg-risk'
                        : c.status === 'moderate'
                          ? 'bg-neon-blue'
                          : 'bg-emerald-glow'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="font-display text-lg text-mist tracking-wide">
            Personal Sustainability Suggestions
          </h3>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-display text-sm text-emerald-glow">
                Level {progress.level}
              </div>
              <div className="font-mono text-[10px] text-mist-dim">
                {progress.points} pts
              </div>
            </div>
            <div className="w-16 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-glow"
                initial={{ width: 0 }}
                animate={{
                  width: `${(progress.pointsIntoCurrentLevel / 50) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((s, i) => {
            const adopted = adoptedActions.has(s.id);
            return (
              <Panel key={s.id} from="up" delay={i * 0.08} tone={adopted ? 'good' : 'default'}>
                <button
                  onClick={() => handleToggle(s.id)}
                  className="w-full text-left group"
                  title={adopted ? 'Mark as not adopted' : 'Mark as adopted'}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border transition-colors duration-200 ${
                        adopted
                          ? 'bg-emerald-glow/15 border-emerald-glow text-emerald-glow'
                          : 'border-white/20 text-transparent group-hover:border-emerald-glow/40'
                      }`}
                    >
                      ✓
                    </span>
                    <p className="text-sm font-body text-mist-dim leading-relaxed flex-1">
                      {s.text}
                    </p>
                  </div>
                  {adopted && (
                    <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-glow/70">
                      +{10} impact points
                    </div>
                  )}
                </button>
              </Panel>
            );
          })}
        </div>
      </div>
    </div>
  );
}
