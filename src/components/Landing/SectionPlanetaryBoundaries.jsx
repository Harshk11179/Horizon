import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const BOUNDARIES = [
  {
    id: 'climate',
    name: 'Climate Change',
    icon: '🌡',
    status: 'exceeded',
    statusLabel: 'Boundary Exceeded',
    current: 421,
    safe: 350,
    unit: 'ppm CO₂',
    desc: 'Atmospheric CO₂ is 20% above the defined safe boundary of 350 ppm.',
  },
  {
    id: 'biosphere',
    name: 'Biosphere Integrity',
    icon: '🦋',
    status: 'exceeded',
    statusLabel: 'Boundary Exceeded',
    current: 'E/MSY: ~1000',
    safe: 'E/MSY: 10',
    unit: 'Extinction Rate',
    desc: 'Species loss is 100× above the background rate — deep into the danger zone.',
  },
  {
    id: 'land',
    name: 'Land-System Change',
    icon: '🌲',
    status: 'risk',
    statusLabel: 'Increasing Risk',
    current: '43%',
    safe: '75%',
    unit: 'Forest Cover',
    desc: 'Global forest cover has declined from 75% to 43% of pre-industrial levels.',
  },
  {
    id: 'freshwater',
    name: 'Freshwater Change',
    icon: '💧',
    status: 'exceeded',
    statusLabel: 'Boundary Exceeded',
    current: '2590',
    safe: '1500',
    unit: 'km³/yr',
    desc: 'Annual freshwater consumption now exceeds the safe planetary limit.',
  },
  {
    id: 'biogeochemical',
    name: 'Biogeochemical Flows',
    icon: '⚗',
    status: 'exceeded',
    statusLabel: 'Boundary Exceeded',
    current: 'P: 22 Tg/yr',
    safe: 'P: 11 Tg/yr',
    unit: 'N & P Flows',
    desc: 'Nitrogen and phosphorus flows from agriculture far exceed safe limits.',
  },
  {
    id: 'ocean',
    name: 'Ocean Acidification',
    icon: '🌊',
    status: 'safe',
    statusLabel: 'Within Boundary',
    current: 'Ω: 2.9',
    safe: 'Ω: >2.75',
    unit: 'Aragonite Saturation',
    desc: 'Currently within the safe zone, but declining rapidly under CO₂ pressure.',
  },
  {
    id: 'aerosol',
    name: 'Atmospheric Aerosol Loading',
    icon: '🌫',
    status: 'risk',
    statusLabel: 'Increasing Risk',
    current: 'Regional',
    safe: 'Stable',
    unit: 'AOD Index',
    desc: 'South and East Asia show dangerous regional aerosol concentrations.',
  },
  {
    id: 'ozone',
    name: 'Stratospheric Ozone Depletion',
    icon: '☀',
    status: 'safe',
    statusLabel: 'Recovering',
    current: '297 DU',
    safe: '>276 DU',
    unit: 'Dobson Units',
    desc: 'Recovering following the Montreal Protocol — a rare planetary success story.',
  },
  {
    id: 'novel',
    name: 'Novel Entities',
    icon: '☢',
    status: 'exceeded',
    statusLabel: 'Boundary Exceeded',
    current: 'Unquantified',
    safe: 'Precautionary',
    unit: 'Synthetic Chemicals',
    desc: 'Plastics, PFAS, and microplastics now detected everywhere on Earth.',
  },
];

const STATUS_CONFIG = {
  exceeded: { color: '#FF3B5C', bg: 'rgba(255,59,92,0.08)', border: 'rgba(255,59,92,0.25)', dot: '#FF3B5C' },
  risk:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', dot: '#F59E0B' },
  safe:     { color: '#00F5A0', bg: 'rgba(0,245,160,0.08)', border: 'rgba(0,245,160,0.25)', dot: '#00F5A0' },
};

function BoundaryCard({ boundary, index }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const cfg = STATUS_CONFIG[boundary.status];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-2xl p-5 cursor-default transition-colors duration-500"
      style={{
        background: hovered ? cfg.bg : 'rgba(11,17,32,0.6)',
        border: `1px solid ${hovered ? cfg.border : 'rgba(255,255,255,0.07)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.color}20`
          : '0 4px 16px rgba(0,0,0,0.35)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{boundary.icon}</span>
          <div>
            <div className="font-display text-sm font-medium text-mist leading-tight">
              {boundary.name}
            </div>
          </div>
        </div>
        {/* Status dot */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: cfg.dot,
              boxShadow: `0 0 6px ${cfg.dot}`,
              animation: boundary.status === 'exceeded' ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span
            className="font-mono text-[9px] uppercase tracking-wider hidden sm:block"
            style={{ color: cfg.color }}
          >
            {boundary.statusLabel}
          </span>
        </div>
      </div>

      {/* Values */}
      <div className="flex items-center gap-3 mb-3">
        <div>
          <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-wider">
            Current
          </div>
          <div
            className="font-mono text-sm font-semibold tabular-nums"
            style={{ color: cfg.color }}
          >
            {boundary.current}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div>
          <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-wider">
            Safe Zone
          </div>
          <div className="font-mono text-sm text-mist-dim tabular-nums">
            {boundary.safe}
          </div>
        </div>
      </div>

      {/* Description — revealed on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="font-body text-xs text-mist-dim leading-relaxed overflow-hidden"
          >
            {boundary.desc}
          </motion.p>
        )}
      </AnimatePresence>
      {!hovered && (
        <p className="font-body text-xs text-mist-subtle leading-relaxed line-clamp-2">
          {boundary.desc}
        </p>
      )}
    </motion.div>
  );
}

function BoundaryLegend() {
  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.dot }} />
          <span className="font-mono text-[11px] text-mist-subtle capitalize">{key}</span>
        </div>
      ))}
    </div>
  );
}

export default function SectionPlanetaryBoundaries() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });

  const exceededCount = BOUNDARIES.filter((b) => b.status === 'exceeded').length;

  return (
    <section
      id="planetary-boundaries"
      className="relative w-full py-28 px-6"
      style={{
        background: 'transparent',
      }}
    >
      <div className="relative max-w-7xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="w-8 h-px bg-risk/40" />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-risk/70">
              Earth System Science
            </span>
            <span className="w-8 h-px bg-risk/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-mist leading-tight mb-5"
          >
            The Nine{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FF3B5C 0%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Planetary Boundaries
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-lg text-mist-dim max-w-2xl mx-auto leading-relaxed mb-6"
          >
            Scientists have identified nine Earth-system processes that define a
            safe operating space for humanity. Horizon tracks all of them.
          </motion.p>

          {/* Alarming stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={headingInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-12"
            style={{
              background: 'rgba(255,59,92,0.08)',
              border: '1px solid rgba(255,59,92,0.25)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-risk animate-pulse" />
            <span className="font-mono text-sm text-risk">
              {exceededCount} of 9 boundaries already exceeded
            </span>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {BOUNDARIES.map((b, i) => (
            <BoundaryCard key={b.id} boundary={b} index={i} />
          ))}
        </div>

        <BoundaryLegend />
      </div>
    </section>
  );
}
