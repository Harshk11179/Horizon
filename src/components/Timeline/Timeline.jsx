import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { getTrendData } from '@services/environmentalDataService';

const CHART_WIDTH = 800;
const CHART_HEIGHT = 180;
const PADDING = { top: 20, right: 20, bottom: 30, left: 20 };

/**
 * Timeline
 *
 * "Animated horizontal environmental timeline. Monthly changes.
 * Animated lines. Moving particles along graph. Hover reveals
 * details." — built as an SVG line chart (not a canvas chart library)
 * since the data volume is tiny (12 points) and a hand-built SVG path
 * gives full control over the moving-particle-along-the-path effect,
 * which off-the-shelf chart libraries (recharts, chart.js) don't
 * expose as a primitive — they'd need to be fought into supporting it,
 * versus a few lines of path math here.
 */
export default function Timeline({ locationId }) {
  const [trend, setTrend] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const particleRef = useRef();

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

  const { points, pathD, minScore, maxScore } = useMemo(() => {
    if (trend.length === 0) return { points: [], pathD: '', minScore: 0, maxScore: 100 };

    const scores = trend.map((d) => d.score);
    const minScore = Math.min(...scores) - 5;
    const maxScore = Math.max(...scores) + 5;
    const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    const points = trend.map((d, i) => {
      const x = PADDING.left + (i / (trend.length - 1)) * innerWidth;
      const normalizedScore = (d.score - minScore) / (maxScore - minScore);
      const y = PADDING.top + innerHeight - normalizedScore * innerHeight;
      return { x, y, ...d };
    });

    const pathD = points.reduce((acc, p, i) => {
      return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '');

    return { points, pathD, minScore, maxScore };
  }, [trend]);

  // Moving particle animation along the path — animates a 0-1 "t"
  // value via a CSS animation on an SVG <animateMotion> element rather
  // than a JS-driven position update, since SVG's native path-following
  // animation is both simpler and cheaper than recomputing point-along-
  // path in a requestAnimationFrame loop for what's purely a decorative
  // effect.
  if (loading || points.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
      </div>
    );
  }

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fill beneath the line */}
        <motion.path
          d={`${pathD} L ${points[points.length - 1].x} ${CHART_HEIGHT - PADDING.bottom} L ${points[0].x} ${CHART_HEIGHT - PADDING.bottom} Z`}
          fill="url(#timelineGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* The line itself, drawn on with a stroke-dashoffset animation */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#00D9FF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Moving particle along the path */}
        <circle r="4" fill="#00FFA3">
          <animateMotion dur="4s" repeatCount="indefinite" path={pathD} />
        </circle>

        {/* Interactive hover targets + point markers */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 5 : 3}
              fill={hoveredIndex === i ? '#00FFA3' : '#00D9FF'}
              style={{ transition: 'r 0.15s ease-out' }}
            />
            {/* Larger invisible hit target — the visible dot (r=3) is
                too small to comfortably hover on its own */}
            <circle
              cx={p.x}
              cy={p.y}
              r={14}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={p.x}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              className="fill-mist-dim"
              style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {p.month}
            </text>
          </g>
        ))}
      </svg>

      {hoveredPoint && (
        <div
          className="absolute glass-panel-strong px-3 py-2 pointer-events-none -translate-x-1/2"
          style={{
            left: `${(hoveredPoint.x / CHART_WIDTH) * 100}%`,
            top: `${(hoveredPoint.y / CHART_HEIGHT) * 100 - 18}%`,
          }}
        >
          <div className="font-mono text-xs text-mist whitespace-nowrap">
            <div>Score: {hoveredPoint.score}</div>
            <div className="text-mist-dim">AQI: {hoveredPoint.airQuality}</div>
            <div className="text-mist-dim">Water: {hoveredPoint.waterStress}</div>
          </div>
        </div>
      )}
    </div>
  );
}
