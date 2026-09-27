import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const CHANGE_CASES = [
  {
    id: 'forest',
    label: 'Forest Cover Loss',
    location: 'Amazon Basin, Brazil',
    period: '2010 → 2024',
    change: '−18.4% canopy',
    icon: '🌲',
    color: '#00F5A0',
    beforeBg: 'linear-gradient(135deg, #1a3a1a 0%, #2a5a2a 40%, #1a4a1a 100%)',
    afterBg: 'linear-gradient(135deg, #3a2a1a 0%, #5a3a1a 40%, #7a5a2a 100%)',
    beforeLabel: 'Dense canopy',
    afterLabel: 'Deforested',
    severity: 'critical',
  },
  {
    id: 'urban',
    label: 'Urban Expansion',
    location: 'Bengaluru, India',
    period: '2000 → 2024',
    change: '+340% built area',
    icon: '🏙',
    color: '#4F8EFF',
    beforeBg: 'linear-gradient(135deg, #1a3a1a 0%, #2a5a2a 30%, #3a3a2a 100%)',
    afterBg: 'linear-gradient(135deg, #2a2a3a 0%, #3a3a5a 40%, #2a2a4a 100%)',
    beforeLabel: 'Green cover',
    afterLabel: 'Concrete sprawl',
    severity: 'moderate',
  },
  {
    id: 'water',
    label: 'Water Body Shrinkage',
    location: 'Aral Sea Region',
    period: '1990 → 2024',
    change: '−87% surface area',
    icon: '💧',
    color: '#00D4FF',
    beforeBg: 'linear-gradient(135deg, #0a2a4a 0%, #0a3a6a 50%, #0a2a5a 100%)',
    afterBg: 'linear-gradient(135deg, #3a3a2a 0%, #5a4a2a 50%, #4a3a1a 100%)',
    beforeLabel: 'Open water',
    afterLabel: 'Dry lakebed',
    severity: 'critical',
  },
  {
    id: 'coastal',
    label: 'Coastal Change',
    location: 'Bangladesh Delta',
    period: '2005 → 2024',
    change: '−2.1km coastline',
    icon: '🌊',
    color: '#F59E0B',
    beforeBg: 'linear-gradient(135deg, #0a2a3a 0%, #0a1a2a 40%, #1a2a1a 100%)',
    afterBg: 'linear-gradient(135deg, #0a2a4a 0%, #0a2a6a 60%, #0a1a4a 100%)',
    beforeLabel: 'Land visible',
    afterLabel: 'Submerged',
    severity: 'moderate',
  },
];

const SEVERITY_COLORS = {
  critical: '#FF3B5C',
  moderate: '#F59E0B',
};

function BeforeAfterCard({ changeCase, index }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { once: true, amount: 0.2 });

  function handleMouseMove(e) {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    setSliderPosition((x / rect.width) * 100);
  }

  function handleTouchMove(e) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.touches[0].clientX - rect.left, 0), rect.width);
    setSliderPosition((x / rect.width) * 100);
  }

  const severityColor = SEVERITY_COLORS[changeCase.severity];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel overflow-hidden"
    >
      {/* Card header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{changeCase.icon}</span>
            <div>
              <div className="font-display text-sm font-semibold text-mist">
                {changeCase.label}
              </div>
              <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-wider mt-0.5">
                {changeCase.location}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className="font-mono text-sm font-bold tabular-nums"
              style={{ color: severityColor }}
            >
              {changeCase.change}
            </div>
            <div className="font-mono text-[10px] text-mist-subtle">{changeCase.period}</div>
          </div>
        </div>
      </div>

      {/* Before/After slider */}
      <div
        ref={containerRef}
        className="relative h-40 cursor-col-resize select-none overflow-hidden"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{ touchAction: 'none' }}
      >
        {/* Before layer */}
        <div
          className="absolute inset-0"
          style={{ background: changeCase.beforeBg }}
        >
          {/* Simulated environmental features */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(ellipse 60% 40% at 30% 50%, ${changeCase.color}40 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-2 left-3 font-mono text-[10px] text-white/60 uppercase tracking-wider"
          >
            Before
          </div>
          <div
            className="absolute top-2 left-3 font-mono text-[10px] uppercase tracking-wider"
            style={{ color: changeCase.color }}
          >
            {changeCase.beforeLabel}
          </div>
        </div>

        {/* After layer (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="absolute inset-0"
            style={{ background: changeCase.afterBg, width: `${10000 / sliderPosition}%` }}
          >
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 8px)',
              }}
            />
            <div
              className="absolute bottom-2 left-3 font-mono text-[10px] text-white/60 uppercase tracking-wider"
            >
              After
            </div>
            <div
              className="absolute top-2 left-3 font-mono text-[10px] uppercase tracking-wider"
              style={{ color: severityColor }}
            >
              {changeCase.afterLabel}
            </div>
          </div>
        </div>

        {/* Slider line */}
        <div
          className="absolute inset-y-0 w-0.5 pointer-events-none"
          style={{ left: `${sliderPosition}%`, background: 'rgba(255,255,255,0.7)' }}
        >
          {/* Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(7,12,24,0.9)',
              border: '2px solid rgba(255,255,255,0.5)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex gap-0.5">
              <div className="w-px h-3 bg-white/60 rounded" />
              <div className="w-px h-3 bg-white/60 rounded" />
            </div>
          </div>
        </div>

        {/* Hint text */}
        {!isDragging && sliderPosition === 50 && (
          <div
            className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none"
          >
            <span
              className="font-mono text-[9px] uppercase tracking-widest text-white/30 bg-black/30 px-2 py-0.5 rounded-full"
            >
              ← drag to compare →
            </span>
          </div>
        )}
      </div>

      {/* Demo badge */}
      <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-neon-blue/50" />
        <span className="font-mono text-[10px] text-mist-subtle tracking-wide">
          Demo visualization — satellite imagery integration in progress
        </span>
      </div>
    </motion.div>
  );
}

export default function SectionSatelliteChange() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });

  return (
    <section
      id="satellite-change"
      className="relative w-full py-28 px-6"
      style={{
        background: 'transparent',
      }}
    >
      <div className="relative max-w-7xl mx-auto">
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
              Satellite Change Detection
            </span>
            <span className="w-8 h-px bg-neon-blue/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-mist leading-tight mb-5"
          >
            See how{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #4F8EFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              places are changing.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-lg text-mist-dim max-w-2xl mx-auto leading-relaxed"
          >
            Horizon uses satellite imagery to track environmental change over time.
            Drag the slider to compare how locations have transformed.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHANGE_CASES.map((c, i) => (
            <BeforeAfterCard key={c.id} changeCase={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
