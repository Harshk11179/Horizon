import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const INDICATORS = [
  {
    key: 'climate',
    label: 'Climate',
    icon: '🌡',
    value: 68,
    unit: 'Risk Index',
    status: 'moderate',
    statusLabel: 'Elevated',
    trend: '+2.1% / yr',
    trendUp: true,
    color: '#00D4FF',
    desc: 'Global mean temperature anomaly trending above pre-industrial baseline.',
  },
  {
    key: 'freshwater',
    label: 'Fresh Water',
    icon: '💧',
    value: 42,
    unit: 'Availability',
    status: 'risk',
    statusLabel: 'Stressed',
    trend: '−1.4% / yr',
    trendUp: false,
    color: '#4F8EFF',
    desc: 'Global freshwater withdrawal approaching planetary boundary limits.',
  },
  {
    key: 'land',
    label: 'Land',
    icon: '🌾',
    value: 55,
    unit: 'Cover Index',
    status: 'moderate',
    statusLabel: 'Degrading',
    trend: '−0.8% / yr',
    trendUp: false,
    color: '#00D4FF',
    desc: 'Land-use change accelerating across tropical and semi-arid regions.',
  },
  {
    key: 'biodiversity',
    label: 'Biodiversity',
    icon: '🦋',
    value: 31,
    unit: 'Integrity',
    status: 'risk',
    statusLabel: 'Critical',
    trend: '−3.5% / yr',
    trendUp: false,
    color: '#FF3B5C',
    desc: 'Species extinction rate far exceeds the safe planetary boundary.',
  },
  {
    key: 'air',
    label: 'Air Quality',
    icon: '🌬',
    value: 74,
    unit: 'AQI Index',
    status: 'moderate',
    statusLabel: 'Moderate',
    trend: '+0.6% / yr',
    trendUp: true,
    color: '#00D4FF',
    desc: 'Particulate and NO₂ concentrations remain above WHO safe thresholds in 70% of cities.',
  },
  {
    key: 'ocean',
    label: 'Ocean Health',
    icon: '🌊',
    value: 49,
    unit: 'Health Score',
    status: 'moderate',
    statusLabel: 'Declining',
    trend: '−1.2% / yr',
    trendUp: false,
    color: '#4F8EFF',
    desc: 'Ocean acidification and warming deoxygenating marine ecosystems globally.',
  },
];

const STATUS_COLORS = {
  good: '#00F5A0',
  moderate: '#00D4FF',
  risk: '#FF3B5C',
};

function GaugeRing({ value, color, size = 80 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={6}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}
      />
    </svg>
  );
}

function IndicatorCard({ indicator, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const statusColor = STATUS_COLORS[indicator.status] ?? '#00D4FF';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel p-5 flex flex-col gap-4 group hover:border-neon-blue/20 transition-colors duration-500"
      style={{ minHeight: 220 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl mb-1">{indicator.icon}</div>
          <div className="font-display text-sm font-medium text-mist tracking-wide">
            {indicator.label}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-mist-subtle mt-0.5">
            {indicator.unit}
          </div>
        </div>

        {/* Gauge */}
        <div className="relative flex-shrink-0">
          {inView && <GaugeRing value={indicator.value} color={indicator.color} size={72} />}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ paddingTop: 2 }}
          >
            <span
              className="font-mono text-sm font-semibold tabular-nums"
              style={{ color: indicator.color }}
            >
              {indicator.value}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="font-body text-xs text-mist-subtle leading-relaxed flex-1">
        {indicator.desc}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <span
          className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{
            color: statusColor,
            background: `${statusColor}14`,
            border: `1px solid ${statusColor}30`,
          }}
        >
          {indicator.statusLabel}
        </span>
        <span
          className="font-mono text-[11px] tabular-nums"
          style={{ color: indicator.trendUp ? '#FF3B5C' : '#00F5A0' }}
        >
          {indicator.trend}
        </span>
      </div>
    </motion.div>
  );
}

export default function SectionPlanetaryHealth() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });

  return (
    <section
      id="planetary-health"
      className="relative w-full py-28 px-6"
      style={{
        background: 'transparent',
      }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Section heading */}
        <div ref={headingRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="w-8 h-px bg-neon-blue/40" />
            <span
              className="font-mono text-[11px] uppercase tracking-[0.25em]"
              style={{ color: 'rgba(0,212,255,0.7)' }}
            >
              Planetary Intelligence
            </span>
            <span className="w-8 h-px bg-neon-blue/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-mist leading-tight mb-5"
          >
            See the health of{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #00F5A0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              our planet.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-lg text-mist-dim max-w-2xl mx-auto leading-relaxed"
          >
            Horizon pulls environmental data from NASA, NOAA, CPCB, and other
            trusted sources into one place — then turns the complexity into
            insights you can actually understand.
          </motion.p>
        </div>

        {/* Indicator grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDICATORS.map((ind, i) => (
            <IndicatorCard key={ind.key} indicator={ind} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-center mt-10"
        >
          <span className="font-mono text-[11px] text-mist-subtle tracking-wide">
            * Values represent global aggregates — demo data. Real-time ingestion from
            NASA / NOAA APIs in progress.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
