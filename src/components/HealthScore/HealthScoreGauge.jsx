import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';

/**
 * HealthScoreGauge
 *
 * The signature visual element for this build (see the design plan
 * from the earlier phase). Deliberately NOT a smooth SVG stroke arc —
 * built from individual tick marks that light up sequentially as the
 * score counts up, evoking a real instrument gauge/radar sweep rather
 * than a generic progress ring. This is the one place the design
 * spends extra visual complexity; everything else in the UI stays
 * disciplined so this element reads as the deliberate focal point it's
 * meant to be.
 *
 * @param {number} score - 0-100
 * @param {number} monthlyChange - signed integer, shown as a trend indicator
 * @param {'lg'|'md'|'sm'} size - controls overall gauge diameter
 */
const SIZE_CONFIG = {
  lg: { diameter: 220, tickCount: 60, strokeWidth: 3, fontSize: 'text-6xl' },
  md: { diameter: 160, tickCount: 48, strokeWidth: 2.5, fontSize: 'text-4xl' },
  sm: { diameter: 110, tickCount: 36, strokeWidth: 2, fontSize: 'text-2xl' },
};

function scoreToColor(score) {
  if (score >= 75) return '#00FFA3'; // emerald — healthy
  if (score >= 50) return '#00D9FF'; // neon blue — moderate
  return '#FF3B5C'; // risk — poor
}

export default function HealthScoreGauge({ score, monthlyChange = 0, size = 'lg', label = 'Environmental Score' }) {
  const config = SIZE_CONFIG[size];
  const [displayScore, setDisplayScore] = useState(0);
  const startTimeRef = useRef(null);
  const COUNT_DURATION = 1600; // ms

  const color = scoreToColor(score);
  const radius = config.diameter / 2;
  const tickInnerRadius = radius - 14;
  const tickOuterRadius = radius - 4;

  // Count-up animation via useAnimationFrame (framer-motion) rather
  // than a CSS transition on a number — CSS can't animate discrete
  // integer text content, so the count-up has to be driven by JS
  // state updates timed against elapsed animation time.
  useAnimationFrame((time) => {
    if (startTimeRef.current === null) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const t = Math.min(elapsed / COUNT_DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    setDisplayScore(Math.round(eased * score));
  });

  const ticks = useMemo(() => {
    const result = [];
    // Gauge sweeps 270° (like a real instrument dial, not a full 360°
    // circle) — leaves a visual "gap" at the bottom that reads as a
    // dial's start/end rather than an ambiguous closed loop.
    const sweepDegrees = 270;
    const startAngle = -225; // degrees, so the gap sits at the bottom

    for (let i = 0; i < config.tickCount; i++) {
      const angle = startAngle + (i / (config.tickCount - 1)) * sweepDegrees;
      const rad = (angle * Math.PI) / 180;
      const x1 = radius + Math.cos(rad) * tickInnerRadius;
      const y1 = radius + Math.sin(rad) * tickInnerRadius;
      const x2 = radius + Math.cos(rad) * tickOuterRadius;
      const y2 = radius + Math.sin(rad) * tickOuterRadius;

      const tickThreshold = (i / (config.tickCount - 1)) * 100;
      const isLit = tickThreshold <= displayScore;

      result.push({ x1, y1, x2, y2, isLit, key: i });
    }
    return result;
  }, [config.tickCount, radius, tickInnerRadius, tickOuterRadius, displayScore]);

  const trendColor = monthlyChange > 0 ? 'text-emerald-glow' : monthlyChange < 0 ? 'text-risk' : 'text-mist-dim';
  const trendSymbol = monthlyChange > 0 ? '▲' : monthlyChange < 0 ? '▼' : '—';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
        <svg width={config.diameter} height={config.diameter} className="absolute inset-0">
          {ticks.map((tick) => (
            <line
              key={tick.key}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.isLit ? color : 'rgba(255,255,255,0.08)'}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              style={{
                transition: 'stroke 0.15s ease-out',
                filter: tick.isLit ? `drop-shadow(0 0 3px ${color})` : 'none',
              }}
            />
          ))}
        </svg>

        {/* Pulsing center glow — subtle, reinforces the gauge as an
            active/live instrument rather than a static readout */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${color}22 0%, transparent 65%)`,
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-medium tabular-nums ${config.fontSize} text-mist`}>
            {displayScore}
          </span>
          {size !== 'sm' && (
            <span className={`font-mono text-xs mt-1 ${trendColor} flex items-center gap-1`}>
              {trendSymbol} {Math.abs(monthlyChange)}
            </span>
          )}
        </div>
      </div>

      {size !== 'sm' && (
        <span className="mt-3 font-body text-sm text-mist-dim tracking-wide">{label}</span>
      )}
    </div>
  );
}
