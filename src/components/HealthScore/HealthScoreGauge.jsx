import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';

const SIZE_CONFIG = {
  lg: { diameter: 224, tickCount: 72, strokeWidth: 2.5, fontSize: 'text-6xl', innerR: 72 },
  md: { diameter: 164, tickCount: 54, strokeWidth: 2,   fontSize: 'text-4xl', innerR: 52 },
  sm: { diameter: 112, tickCount: 40, strokeWidth: 1.5, fontSize: 'text-2xl', innerR: 34 },
};

function scoreToColor(score) {
  if (score >= 75) return '#00F5A0';
  if (score >= 50) return '#00D4FF';
  return '#FF3B5C';
}

function scoreToGlow(score) {
  if (score >= 75) return 'rgba(0,245,160,0.5)';
  if (score >= 50) return 'rgba(0,212,255,0.5)';
  return 'rgba(255,59,92,0.5)';
}

export default function HealthScoreGauge({
  score,
  monthlyChange = 0,
  size = 'lg',
  label = 'Environmental Score',
}) {
  const config = SIZE_CONFIG[size];
  const [displayScore, setDisplayScore] = useState(0);
  const startTimeRef = useRef(null);
  const COUNT_DURATION = 1800;

  const color = scoreToColor(score);
  const glowColor = scoreToGlow(score);
  const radius = config.diameter / 2;
  const tickInnerR = radius - 16;
  const tickOuterR = radius - 5;

  useAnimationFrame((time) => {
    if (startTimeRef.current === null) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const t = Math.min(elapsed / COUNT_DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    setDisplayScore(Math.round(eased * score));
  });

  const ticks = useMemo(() => {
    const result = [];
    const sweepDeg = 270;
    const startAngle = -225;
    for (let i = 0; i < config.tickCount; i++) {
      const angle = startAngle + (i / (config.tickCount - 1)) * sweepDeg;
      const rad = (angle * Math.PI) / 180;
      // Major tick every 6th
      const isMajor = i % 6 === 0;
      const innerR = isMajor ? tickInnerR - 4 : tickInnerR;
      const x1 = radius + Math.cos(rad) * innerR;
      const y1 = radius + Math.sin(rad) * innerR;
      const x2 = radius + Math.cos(rad) * tickOuterR;
      const y2 = radius + Math.sin(rad) * tickOuterR;
      const tickThreshold = (i / (config.tickCount - 1)) * 100;
      const isLit = tickThreshold <= displayScore;
      result.push({ x1, y1, x2, y2, isLit, key: i, isMajor });
    }
    return result;
  }, [config.tickCount, radius, tickInnerR, tickOuterR, displayScore]);

  const trendColor = monthlyChange > 0 ? '#00F5A0' : monthlyChange < 0 ? '#FF3B5C' : '#9AB3CC';
  const trendSymbol = monthlyChange > 0 ? '▲' : monthlyChange < 0 ? '▼' : '—';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
        {/* Outer ambient glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.02, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${color}18 0%, transparent 65%)`,
          }}
        />

        <svg width={config.diameter} height={config.diameter} className="absolute inset-0">
          {/* Dim track ring */}
          {ticks.map((tick) => (
            <line
              key={`track-${tick.key}`}
              x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={tick.isMajor ? config.strokeWidth + 0.5 : config.strokeWidth}
              strokeLinecap="round"
            />
          ))}
          {/* Lit ticks */}
          {ticks.map((tick) =>
            tick.isLit ? (
              <line
                key={`lit-${tick.key}`}
                x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
                stroke={color}
                strokeWidth={tick.isMajor ? config.strokeWidth + 0.5 : config.strokeWidth}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 ${tick.isMajor ? 5 : 3}px ${glowColor})`,
                  transition: 'stroke 0.1s ease-out',
                }}
              />
            ) : null
          )}

          {/* Inner score arc accent — faint background ring */}
          <circle
            cx={radius} cy={radius} r={config.innerR}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={1}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono font-semibold tabular-nums ${config.fontSize}`}
            style={{ color, textShadow: `0 0 30px ${glowColor}` }}
          >
            {displayScore}
          </span>
          {size !== 'sm' && (
            <span
              className="font-mono text-xs mt-1 flex items-center gap-1"
              style={{ color: trendColor }}
            >
              {trendSymbol}{' '}
              <span style={{ color: 'rgba(154,179,204,0.8)' }}>
                {Math.abs(monthlyChange)}
              </span>
            </span>
          )}
        </div>
      </div>

      {size !== 'sm' && (
        <span className="mt-3 font-mono text-[10px] uppercase tracking-widest text-mist-subtle">
          {label}
        </span>
      )}
    </div>
  );
}
