import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const PREDICTIONS = [
  {
    id: 'groundwater',
    label: 'Groundwater',
    icon: '💧',
    prediction: 'Likely decline over the next 6 months',
    confidence: 78,
    horizon: '6 months',
    trend: 'declining',
    trendValue: '−12%',
    color: '#4F8EFF',
    data: [65, 63, 61, 58, 55, 52, 49, 46, 44, 41, 38, 35],
    status: 'risk',
    note: 'Monsoon deficit and increasing extraction rates driving decline.',
  },
  {
    id: 'airquality',
    label: 'Air Quality',
    icon: '🌬',
    prediction: 'Pollution risk increasing during winter',
    confidence: 84,
    horizon: '3 months',
    trend: 'worsening',
    trendValue: '+24%',
    color: '#F59E0B',
    data: [42, 44, 46, 48, 52, 58, 65, 72, 78, 82, 87, 90],
    status: 'moderate',
    note: 'Temperature inversion trapping pollutants in the boundary layer.',
  },
  {
    id: 'heat',
    label: 'Urban Heat',
    icon: '🌡',
    prediction: 'Heat intensity trending upward',
    confidence: 91,
    horizon: '12 months',
    trend: 'increasing',
    trendValue: '+1.4°C',
    color: '#FF3B5C',
    data: [30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 43],
    status: 'risk',
    note: 'Urban densification reducing albedo and increasing heat retention.',
  },
  {
    id: 'flooding',
    label: 'Flood Risk',
    icon: '🌊',
    prediction: 'Elevated risk during peak monsoon',
    confidence: 72,
    horizon: '4 months',
    trend: 'elevated',
    trendValue: '2.3× avg',
    color: '#4F8EFF',
    data: [10, 12, 18, 28, 45, 72, 85, 80, 60, 35, 20, 12],
    status: 'moderate',
    note: 'Drainage capacity insufficient relative to projected peak discharge.',
  },
];

const STATUS_COLORS = {
  good: '#00F5A0',
  moderate: '#F59E0B',
  risk: '#FF3B5C',
};

function Sparkline({ data, color, width = 120, height = 40 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
      />
      {/* End dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const x = (data.length - 1) * stepX;
        const y = height - ((last - min) / range) * (height - 8) - 4;
        return (
          <circle cx={x} cy={y} r={3} fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        );
      })()}
    </svg>
  );
}

function PredictionCard({ prediction, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const statusColor = STATUS_COLORS[prediction.status] ?? '#00D4FF';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel p-5 flex flex-col gap-4 hover:border-neon-blue/20 transition-colors duration-500"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{prediction.icon}</span>
          <div>
            <div className="font-display text-sm font-semibold text-mist">
              {prediction.label}
            </div>
            <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-wider mt-0.5">
              {prediction.horizon} forecast
            </div>
          </div>
        </div>

        {/* Confidence badge */}
        <div
          className="text-right px-2.5 py-1 rounded-lg"
          style={{
            background: `${prediction.color}12`,
            border: `1px solid ${prediction.color}25`,
          }}
        >
          <div
            className="font-mono text-lg font-bold tabular-nums leading-none"
            style={{ color: prediction.color }}
          >
            {prediction.confidence}%
          </div>
          <div className="font-mono text-[9px] text-mist-subtle uppercase tracking-wider">
            confidence
          </div>
        </div>
      </div>

      {/* Prediction text */}
      <div
        className="px-3 py-2.5 rounded-xl"
        style={{
          background: `${statusColor}08`,
          border: `1px solid ${statusColor}20`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusColor }} />
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: statusColor }}>
            AI Prediction
          </span>
        </div>
        <p className="font-body text-sm text-mist leading-snug">{prediction.prediction}</p>
      </div>

      {/* Sparkline + trend */}
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-wider mb-2">
            Trend
          </div>
          {inView && <Sparkline data={prediction.data} color={prediction.color} />}
        </div>
        <div className="text-right">
          <div
            className="font-mono text-lg font-bold tabular-nums"
            style={{ color: prediction.color }}
          >
            {prediction.trendValue}
          </div>
          <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-wider">
            projected
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="font-body text-xs text-mist-subtle leading-relaxed border-t border-white/[0.06] pt-3">
        {prediction.note}
      </p>
    </motion.div>
  );
}

export default function SectionRiskPrediction() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });

  return (
    <section
      id="risk-prediction"
      className="relative w-full py-28 px-6"
      style={{
        background: 'transparent',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute left-1/4 top-1/3 w-96 h-96 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(255,59,92,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="w-8 h-px bg-risk/40" />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-risk/70">
              Predictive Intelligence
            </span>
            <span className="w-8 h-px bg-risk/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-mist leading-tight mb-5"
          >
            Don&apos;t just monitor risk.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FF3B5C 0%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              See what&apos;s coming.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-lg text-mist-dim max-w-2xl mx-auto leading-relaxed"
          >
            Horizon&apos;s prediction engine analyzes historical trends, seasonal patterns,
            and climate models to forecast environmental conditions before they become crises.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {PREDICTIONS.map((p, i) => (
            <PredictionCard key={p.id} prediction={p} index={i} />
          ))}
        </div>

        {/* Demo disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] text-mist-subtle tracking-wide"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue/50" />
            Demo predictions — AI engine training in progress with real climate datasets
          </span>
        </motion.div>
      </div>
    </section>
  );
}
