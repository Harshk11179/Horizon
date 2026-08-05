import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, DASHBOARD_VIEW } from '@hooks/useAppStore';
import { getAllLocations, getTrendData } from '@services/environmentalDataService';
import Panel from '@components/HolographicPanels/Panel';

/**
 * Rankable metrics. "bestFirst" encodes each metric's polarity so the
 * default sort always reads top-to-bottom as best-to-worst, whichever
 * metric is active — the same polarity logic the Compare view uses.
 */
const METRICS = [
  { key: 'score', label: 'Env. Score', lowerIsBetter: false },
  { key: 'airQuality', label: 'Air Quality', lowerIsBetter: true },
  { key: 'waterStress', label: 'Water Stress', lowerIsBetter: true },
  { key: 'greenCover', label: 'Green Cover', lowerIsBetter: false },
  { key: 'climateRisk', label: 'Climate Risk', lowerIsBetter: true },
  { key: 'biodiversity', label: 'Biodiversity', lowerIsBetter: false },
];

function metricValue(location, metricKey) {
  if (metricKey === 'score') return location.environmentalScore;
  return location.indicators[metricKey]?.value ?? 0;
}

/**
 * Sparkline — single series (the location's 12-month score history),
 * so no legend is needed; the column header names it. Dim cyan matches
 * the trend chart's Health Score series identity.
 */
function Sparkline({ trend }) {
  const WIDTH = 96;
  const HEIGHT = 26;
  const PAD = 3;

  if (!trend || trend.length === 0) {
    return <div style={{ width: WIDTH, height: HEIGHT }} />;
  }

  const scores = trend.map((d) => d.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = scores
    .map((score, i) => {
      const x = PAD + (i / (scores.length - 1)) * (WIDTH - PAD * 2);
      const y = PAD + (1 - (score - min) / range) * (HEIGHT - PAD * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const [lastX, lastY] = points.split(' ').pop().split(',');

  return (
    <svg width={WIDTH} height={HEIGHT} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="#00A3C4"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="#00A3C4" />
    </svg>
  );
}

export default function RankingsView() {
  const setSelectedLocationId = useAppStore((state) => state.setSelectedLocationId);
  const setActiveDashboardView = useAppStore((state) => state.setActiveDashboardView);

  const [locations, setLocations] = useState([]);
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [metricKey, setMetricKey] = useState('score');
  const [worstFirst, setWorstFirst] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllLocations().then(async (all) => {
      if (cancelled) return;
      setLocations(all);
      setLoading(false);
      // Sparkline data loads after the list so the table appears fast;
      // each sparkline pops in as its trend resolves.
      const trendEntries = await Promise.all(
        all.map(async (loc) => [loc.id, await getTrendData(loc.id)])
      );
      if (!cancelled) setTrends(Object.fromEntries(trendEntries));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const metric = METRICS.find((m) => m.key === metricKey);
  const ranked = [...locations].sort((a, b) => {
    const diff = metricValue(a, metricKey) - metricValue(b, metricKey);
    const bestFirstDiff = metric.lowerIsBetter ? diff : -diff;
    return worstFirst ? -bestFirstDiff : bestFirstDiff;
  });

  function jumpToLocation(id) {
    setSelectedLocationId(id);
    setActiveDashboardView(DASHBOARD_VIEW.MISSION_CONTROL);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-32 pb-20 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="font-display text-2xl text-mist tracking-wide">Global Rankings</h2>
        <p className="font-mono text-xs text-mist-dim mt-1 uppercase tracking-widest">
          All monitored locations, ranked
        </p>
      </motion.div>

      <Panel from="up" delay={0} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetricKey(m.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors duration-200 border ${
                  metricKey === m.key
                    ? 'bg-neon-blue/10 border-neon-blue/40 text-mist'
                    : 'border-white/10 text-mist-dim hover:text-mist hover:border-white/20'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setWorstFirst((w) => !w)}
            className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 text-mist-dim hover:text-mist transition-colors duration-200"
          >
            {worstFirst ? '▼ Worst first' : '▲ Best first'}
          </button>
        </div>
      </Panel>

      <div className="space-y-2">
        {ranked.map((loc, i) => {
          const rank = i + 1;
          const isTop = rank === 1 && !worstFirst;
          return (
            <motion.button
              key={loc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              onClick={() => jumpToLocation(loc.id)}
              className={`w-full glass-panel px-4 py-3 flex items-center gap-4 text-left border transition-colors duration-300 ${
                isTop
                  ? 'border-emerald-glow/25 hover:border-emerald-glow/50 hover:shadow-glow-emerald'
                  : 'hover:border-neon-blue/40 hover:shadow-glow-blue'
              }`}
              title={`Open ${loc.name} in Mission Control`}
            >
              <span
                className={`font-mono text-sm tabular-nums w-8 text-center ${
                  isTop ? 'text-emerald-glow' : 'text-mist-dim'
                }`}
              >
                {String(rank).padStart(2, '0')}
              </span>

              <div className="flex-1 min-w-0">
                <div className="font-display text-sm text-mist tracking-wide truncate">
                  {loc.name}
                </div>
                <div className="font-mono text-[10px] text-mist-dim/70 uppercase tracking-wide">
                  {loc.capital}
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-center gap-0.5">
                <Sparkline trend={trends[loc.id]} />
                <span className="font-mono text-[8px] text-mist-dim/50 uppercase tracking-widest">
                  12-mo score
                </span>
              </div>

              <div className="flex items-center gap-3 w-28 justify-end">
                <span
                  className={`font-mono text-[10px] ${
                    loc.scoreChangeMonthly > 0
                      ? 'text-emerald-glow'
                      : loc.scoreChangeMonthly < 0
                        ? 'text-risk'
                        : 'text-mist-dim'
                  }`}
                >
                  {loc.scoreChangeMonthly > 0 ? '▲' : loc.scoreChangeMonthly < 0 ? '▼' : '—'}{' '}
                  {Math.abs(loc.scoreChangeMonthly)}
                </span>
                <span className="font-mono text-xl text-mist tabular-nums">
                  {metricValue(loc, metricKey)}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-6 text-center font-mono text-[10px] text-mist-dim/60 uppercase tracking-widest">
        {metric.lowerIsBetter ? 'Lower values rank better' : 'Higher values rank better'} · click a
        row to open it in Mission Control
      </p>
    </div>
  );
}
