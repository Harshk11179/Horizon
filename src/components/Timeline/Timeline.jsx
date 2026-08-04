import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getTrendData } from '@services/environmentalDataService';

const CHART_WIDTH = 800;
const CHART_HEIGHT = 220;
const PADDING = { top: 20, right: 96, bottom: 30, left: 36 };

/**
 * Series colors are deliberately NOT the raw neon brand tokens: they were
 * chosen (and machine-validated) for colorblind-safe separation and an
 * OKLCH lightness band suited to line marks on the void-950 surface.
 * Health Score uses the brand's own dimmed cyan token so the primary
 * series still reads as "EcoSentinel blue".
 */
const SERIES = [
  { key: 'score', label: 'Health Score', color: '#00A3C4' },
  { key: 'airQuality', label: 'Air Quality', color: '#B0791A' },
  { key: 'waterStress', label: 'Water Stress', color: '#8B5CF6' },
];

/**
 * Timeline
 *
 * "Animated horizontal environmental timeline. Monthly changes.
 * Animated lines. Moving particles along graph. Hover reveals
 * details." — built as a hand-rolled SVG multi-line chart (12 points ×
 * 3 series). All three series are 0–100 indices, so they legitimately
 * share ONE y-axis — no dual-axis. The moving particle rides the
 * primary (Health Score) path only, as a decorative accent.
 */
export default function Timeline({ locationId }) {
  const [trend, setTrend] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiddenSeries, setHiddenSeries] = useState(() => new Set());
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTrendData(locationId).then((data) => {
      if (!cancelled) {
        setTrend(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  const visibleSeries = SERIES.filter((s) => !hiddenSeries.has(s.key));

  const { seriesPaths, xPositions, yFor, gridValues } = useMemo(() => {
    if (trend.length === 0) {
      return { seriesPaths: [], xPositions: [], yFor: () => 0, gridValues: [] };
    }

    const allValues = visibleSeries.flatMap((s) => trend.map((d) => d[s.key]));
    const min = Math.max(0, Math.min(...allValues) - 6);
    const max = Math.min(100, Math.max(...allValues) + 6);
    const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    const xPositions = trend.map(
      (_, i) => PADDING.left + (i / (trend.length - 1)) * innerWidth
    );
    const yFor = (value) =>
      PADDING.top + innerHeight - ((value - min) / (max - min)) * innerHeight;

    const seriesPaths = visibleSeries.map((s) => {
      const points = trend.map((d, i) => ({
        x: xPositions[i],
        y: yFor(d[s.key]),
        value: d[s.key],
      }));
      const pathD = points.reduce(
        (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
        ''
      );
      return { ...s, points, pathD };
    });

    // Up to 4 recessive horizontal gridlines at round values inside the domain.
    const step = Math.max(10, Math.round((max - min) / 40) * 10);
    const gridValues = [];
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
      gridValues.push(v);
    }

    return { seriesPaths, xPositions, yFor, gridValues };
  }, [trend, visibleSeries]);

  function toggleSeries(key) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size < SERIES.length - 1) {
        // Never allow hiding the last visible series — an empty chart
        // is a dead end, not a state.
        next.add(key);
      }
      return next;
    });
  }

  if (loading || trend.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
      </div>
    );
  }

  const scoreSeries = seriesPaths.find((s) => s.key === 'score');

  return (
    <div className="relative w-full">
      {/* Legend (identity) + table toggle. Legend chips double as
          visibility toggles; colors stay fixed per series regardless of
          which are visible. */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          {SERIES.map((s) => {
            const hidden = hiddenSeries.has(s.key);
            return (
              <button
                key={s.key}
                onClick={() => toggleSeries(s.key)}
                className={`flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide transition-opacity duration-200 ${
                  hidden ? 'opacity-35' : 'opacity-100'
                }`}
                title={hidden ? `Show ${s.label}` : `Hide ${s.label}`}
              >
                <span
                  className="inline-block w-3 h-[3px] rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-mist-dim">{s.label}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowTable((t) => !t)}
          className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border transition-colors duration-200 ${
            showTable
              ? 'border-neon-blue/40 text-neon-blue bg-neon-blue/5'
              : 'border-white/10 text-mist-dim hover:text-mist'
          }`}
        >
          {showTable ? 'Chart' : 'Table'}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="font-mono text-[10px] uppercase tracking-wider text-mist-dim py-2 pr-4">
                  Month
                </th>
                {SERIES.map((s) => (
                  <th
                    key={s.key}
                    className="font-mono text-[10px] uppercase tracking-wider text-mist-dim py-2 pr-4"
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trend.map((d) => (
                <tr key={d.month} className="border-t border-white/[0.05]">
                  <td className="font-mono text-xs text-mist py-1.5 pr-4">{d.month}</td>
                  {SERIES.map((s) => (
                    <td key={s.key} className="font-mono text-xs text-mist-dim py-1.5 pr-4 tabular-nums">
                      {d[s.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A3C4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#00A3C4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Recessive gridlines + y labels */}
            {gridValues.map((v) => (
              <g key={v}>
                <line
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={yFor(v)}
                  y2={yFor(v)}
                  stroke="rgba(232, 244, 255, 0.06)"
                  strokeWidth={1}
                />
                <text
                  x={PADDING.left - 8}
                  y={yFor(v) + 3}
                  textAnchor="end"
                  className="fill-mist-dim"
                  style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', opacity: 0.7 }}
                >
                  {v}
                </text>
              </g>
            ))}

            {/* Area fill beneath the primary (score) line only */}
            {scoreSeries && (
              <motion.path
                d={`${scoreSeries.pathD} L ${scoreSeries.points[scoreSeries.points.length - 1].x} ${CHART_HEIGHT - PADDING.bottom} L ${scoreSeries.points[0].x} ${CHART_HEIGHT - PADDING.bottom} Z`}
                fill="url(#timelineGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            )}

            {/* Series lines, drawn on with a pathLength animation */}
            {seriesPaths.map((s, si) => (
              <motion.path
                key={s.key}
                d={s.pathD}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: si * 0.15, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}

            {/* Direct end-of-line labels — identity readable without the
                legend; text wears the text token, the colored tick wears
                the series color. */}
            {seriesPaths.map((s) => {
              const last = s.points[s.points.length - 1];
              return (
                <g key={`label-${s.key}`}>
                  <rect
                    x={last.x + 6}
                    y={last.y - 1.5}
                    width={10}
                    height={3}
                    rx={1.5}
                    fill={s.color}
                  />
                  <text
                    x={last.x + 20}
                    y={last.y + 3}
                    className="fill-mist-dim"
                    style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {s.label}
                  </text>
                </g>
              );
            })}

            {/* Moving particle along the primary path */}
            {scoreSeries && (
              <circle r="4" fill="#00FFA3">
                <animateMotion dur="4s" repeatCount="indefinite" path={scoreSeries.pathD} />
              </circle>
            )}

            {/* Crosshair for the hovered month */}
            {hoveredIndex !== null && (
              <line
                x1={xPositions[hoveredIndex]}
                x2={xPositions[hoveredIndex]}
                y1={PADDING.top}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke="rgba(232, 244, 255, 0.18)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            )}

            {/* Point markers on the hovered month */}
            {hoveredIndex !== null &&
              seriesPaths.map((s) => (
                <circle
                  key={`marker-${s.key}`}
                  cx={s.points[hoveredIndex].x}
                  cy={s.points[hoveredIndex].y}
                  r={4.5}
                  fill={s.color}
                  stroke="#05070D"
                  strokeWidth={2}
                />
              ))}

            {/* Month labels + full-height hover columns (hit target far
                bigger than any mark) */}
            {trend.map((d, i) => {
              const columnWidth =
                (CHART_WIDTH - PADDING.left - PADDING.right) / (trend.length - 1);
              return (
                <g key={d.month}>
                  <text
                    x={xPositions[i]}
                    y={CHART_HEIGHT - 8}
                    textAnchor="middle"
                    className="fill-mist-dim"
                    style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {d.month}
                  </text>
                  <rect
                    x={xPositions[i] - columnWidth / 2}
                    y={0}
                    width={columnWidth}
                    height={CHART_HEIGHT}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                  />
                </g>
              );
            })}
          </svg>

          {hoveredIndex !== null && (
            <div
              className="absolute glass-panel-strong px-3 py-2 pointer-events-none z-10"
              style={{
                left: `${(xPositions[hoveredIndex] / CHART_WIDTH) * 100}%`,
                top: 28,
                transform:
                  hoveredIndex > trend.length / 2
                    ? 'translateX(calc(-100% - 12px))'
                    : 'translateX(12px)',
              }}
            >
              <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-1.5">
                {trend[hoveredIndex].month}
              </div>
              {visibleSeries.map((s) => (
                <div key={s.key} className="flex items-center gap-2 py-0.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-mono text-xs text-mist-dim whitespace-nowrap">
                    {s.label}
                  </span>
                  <span className="font-mono text-xs text-mist tabular-nums ml-auto pl-3">
                    {trend[hoveredIndex][s.key]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
