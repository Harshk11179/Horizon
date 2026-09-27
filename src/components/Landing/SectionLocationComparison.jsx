import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const LOCATIONS = [
  { name: 'Mumbai', country: 'India', emoji: '🌆' },
  { name: 'Pune', country: 'India', emoji: '🏙' },
];

const METRICS = [
  {
    id: 'airQuality',
    label: 'Air Quality',
    icon: '🌬',
    unit: 'AQI',
    a: { value: 142, status: 'risk', label: 'Unhealthy' },
    b: { value: 78, status: 'moderate', label: 'Moderate' },
    lowerIsBetter: true,
  },
  {
    id: 'waterStress',
    label: 'Water Stress',
    icon: '💧',
    unit: 'Index',
    a: { value: 3.8, status: 'risk', label: 'Very High' },
    b: { value: 2.1, status: 'moderate', label: 'Moderate' },
    lowerIsBetter: true,
  },
  {
    id: 'greenCover',
    label: 'Green Cover',
    icon: '🌿',
    unit: '%',
    a: { value: 12, status: 'risk', label: 'Low' },
    b: { value: 31, status: 'moderate', label: 'Moderate' },
    lowerIsBetter: false,
  },
  {
    id: 'floodRisk',
    label: 'Flood Risk',
    icon: '🌊',
    unit: 'Score',
    a: { value: 78, status: 'risk', label: 'High' },
    b: { value: 34, status: 'good', label: 'Low' },
    lowerIsBetter: true,
  },
  {
    id: 'temperature',
    label: 'Avg Temperature',
    icon: '🌡',
    unit: '°C',
    a: { value: 29.2, status: 'moderate', label: 'Warm' },
    b: { value: 24.8, status: 'good', label: 'Comfortable' },
    lowerIsBetter: true,
  },
  {
    id: 'healthScore',
    label: 'Environmental Score',
    icon: '♻',
    unit: '/100',
    a: { value: 48, status: 'risk', label: 'Below Average' },
    b: { value: 71, status: 'good', label: 'Good' },
    lowerIsBetter: false,
  },
];

const STATUS_COLORS = {
  good: '#00F5A0',
  moderate: '#F59E0B',
  risk: '#FF3B5C',
};

function ComparisonBar({ valueA, valueB, lowerIsBetter }) {
  const max = Math.max(valueA, valueB, 1);
  const barA = (valueA / max) * 100;
  const barB = (valueB / max) * 100;

  const aWins = lowerIsBetter ? valueA < valueB : valueA > valueB;
  const bWins = lowerIsBetter ? valueB < valueA : valueB > valueA;

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Bar A (right-aligned) */}
      <div className="flex-1 flex justify-end">
        <motion.div
          className="h-1.5 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${barA}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: aWins ? '#00F5A0' : STATUS_COLORS.risk,
            boxShadow: aWins ? '0 0 6px rgba(0,245,160,0.5)' : '0 0 6px rgba(255,59,92,0.4)',
          }}
        />
      </div>

      {/* Center divider */}
      <div className="w-px h-4 bg-white/20 flex-shrink-0" />

      {/* Bar B (left-aligned) */}
      <div className="flex-1">
        <motion.div
          className="h-1.5 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${barB}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: bWins ? '#00F5A0' : STATUS_COLORS.risk,
            boxShadow: bWins ? '0 0 6px rgba(0,245,160,0.5)' : '0 0 6px rgba(255,59,92,0.4)',
          }}
        />
      </div>
    </div>
  );
}

function MetricRow({ metric, index }) {
  const aColor = STATUS_COLORS[metric.a.status] ?? '#00D4FF';
  const bColor = STATUS_COLORS[metric.b.status] ?? '#00D4FF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.5 }}
      className="py-3 border-b border-white/[0.05] last:border-0"
    >
      {/* Values row */}
      <div className="flex items-center justify-between mb-1.5">
        {/* A value */}
        <div className="text-right w-28">
          <span
            className="font-mono text-sm font-semibold tabular-nums"
            style={{ color: aColor }}
          >
            {metric.a.value}{metric.unit}
          </span>
          <div className="font-mono text-[9px] uppercase tracking-wider text-mist-subtle">
            {metric.a.label}
          </div>
        </div>

        {/* Center label */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base">{metric.icon}</span>
          <span className="font-body text-xs text-mist-dim">{metric.label}</span>
        </div>

        {/* B value */}
        <div className="text-left w-28">
          <span
            className="font-mono text-sm font-semibold tabular-nums"
            style={{ color: bColor }}
          >
            {metric.b.value}{metric.unit}
          </span>
          <div className="font-mono text-[9px] uppercase tracking-wider text-mist-subtle">
            {metric.b.label}
          </div>
        </div>
      </div>

      {/* Comparison bars */}
      <ComparisonBar
        valueA={metric.a.value}
        valueB={metric.b.value}
        lowerIsBetter={metric.lowerIsBetter}
      />
    </motion.div>
  );
}

export default function SectionLocationComparison() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });

  return (
    <section
      id="location-comparison"
      className="relative w-full py-28 px-6"
      style={{
        background: 'transparent',
      }}
    >
      <div className="relative max-w-5xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="w-8 h-px bg-neon-blue/40" />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-blue/70">
              Location Intelligence
            </span>
            <span className="w-8 h-px bg-neon-blue/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-mist leading-tight mb-5"
          >
            Compare any{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #4F8EFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              two locations.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-lg text-mist-dim max-w-2xl mx-auto leading-relaxed"
          >
            Understand environmental differences between cities, neighborhoods, or
            project sites — side by side, across every indicator.
          </motion.p>
        </div>

        {/* Comparison card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel-strong overflow-hidden"
        >
          {/* Location headers */}
          <div
            className="grid grid-cols-3 gap-4 p-5 border-b border-white/[0.07]"
          >
            <div className="text-right">
              <div className="text-2xl mb-1">{LOCATIONS[0].emoji}</div>
              <div className="font-display text-lg font-semibold text-mist">{LOCATIONS[0].name}</div>
              <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-widest">
                {LOCATIONS[0].country}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="font-mono text-xl text-mist-subtle">vs</span>
              <div
                className="mt-2 px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest"
                style={{
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  color: 'rgba(0,212,255,0.6)',
                }}
              >
                Compare
              </div>
            </div>

            <div className="text-left">
              <div className="text-2xl mb-1">{LOCATIONS[1].emoji}</div>
              <div className="font-display text-lg font-semibold text-mist">{LOCATIONS[1].name}</div>
              <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-widest">
                {LOCATIONS[1].country}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="px-6 py-2">
            {METRICS.map((m, i) => (
              <MetricRow key={m.id} metric={m} index={i} />
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 border-t border-white/[0.07] flex items-center justify-between flex-wrap gap-3"
          >
            <span className="font-mono text-[10px] text-mist-subtle">
              Demo data — real comparisons available for 36+ cities
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-glow" />
                <span className="font-mono text-[10px] text-mist-subtle">Better</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-risk" />
                <span className="font-mono text-[10px] text-mist-subtle">Worse</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
