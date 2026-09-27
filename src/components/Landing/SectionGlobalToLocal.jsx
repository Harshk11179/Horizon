import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const LEVELS = [
  {
    id: 'global',
    scale: 'Global',
    example: 'Planetary Boundaries',
    desc: 'Horizon monitors Earth-system processes at the planetary scale — CO₂ concentrations, ocean heat, ice coverage.',
    icon: '🌍',
    size: 80,
  },
  {
    id: 'region',
    scale: 'Region',
    example: 'South Asia · EU · Amazon',
    desc: 'Regional environmental trends — monsoon patterns, air quality corridors, transboundary river systems.',
    icon: '🗺',
    size: 64,
  },
  {
    id: 'city',
    scale: 'City',
    example: 'Mumbai · London · Lagos',
    desc: 'Urban environmental intelligence — local AQI, urban heat islands, green cover, flood exposure.',
    icon: '🏙',
    size: 52,
  },
  {
    id: 'local',
    scale: 'Neighborhood',
    example: 'Your location',
    desc: 'Hyperlocal insights — environmental health score for your exact neighborhood, street-level risk.',
    icon: '📍',
    size: 40,
  },
];

function ScaleNode({ level, index, total }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const isLast = index === total - 1;

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative group"
        style={{ width: `${level.size + 48}px` }}
      >
        <div
          className="relative rounded-2xl p-5 text-center transition-all duration-500 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(11,17,32,0.85), rgba(7,12,24,0.92))',
            border: '1px solid rgba(0,212,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Glow on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)',
            }}
          />

          <div className="text-3xl mb-2">{level.icon}</div>
          <div className="font-display text-base font-semibold text-mist mb-1">
            {level.scale}
          </div>
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-3"
            style={{ color: 'rgba(0,212,255,0.7)' }}
          >
            {level.example}
          </div>
          <p className="font-body text-xs text-mist-subtle leading-relaxed">
            {level.desc}
          </p>
        </div>
      </motion.div>

      {/* Connector arrow */}
      {!isLast && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={inView ? { opacity: 1, scaleY: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.15 + 0.35 }}
          className="flex flex-col items-center my-2"
          style={{ transformOrigin: 'top' }}
        >
          <div
            className="w-px h-8"
            style={{
              background: 'linear-gradient(180deg, rgba(0,212,255,0.5) 0%, rgba(0,212,255,0.1) 100%)',
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '6px solid rgba(0,212,255,0.4)',
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

export default function SectionGlobalToLocal() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });

  return (
    <section
      id="global-to-local"
      className="relative w-full py-28 px-6"
      style={{
        background: 'transparent',
      }}
    >
      {/* Radial background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="w-8 h-px bg-neon-blue/40" />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-blue/70">
              Multi-Scale Intelligence
            </span>
            <span className="w-8 h-px bg-neon-blue/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-mist leading-tight mb-5"
          >
            From the planet to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #4F8EFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              your neighborhood.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-lg text-mist-dim max-w-2xl mx-auto leading-relaxed"
          >
            Horizon doesn&apos;t just monitor global conditions — it zooms in. From
            planetary-scale Earth systems all the way down to the street you
            live on.
          </motion.p>
        </div>

        {/* Scale cascade — vertical on mobile, horizontal on desktop */}
        <div className="hidden md:flex items-start justify-center gap-6 lg:gap-10">
          {LEVELS.map((level, i) => (
            <div key={level.id} className="flex items-center gap-6 lg:gap-10">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group"
                >
                  <div
                    className="rounded-2xl p-5 text-center overflow-hidden transition-all duration-500"
                    style={{
                      width: `${level.size + 80}px`,
                      background: 'linear-gradient(135deg, rgba(11,17,32,0.85), rgba(7,12,24,0.92))',
                      border: '1px solid rgba(0,212,255,0.15)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div className="text-3xl mb-2">{level.icon}</div>
                    <div className="font-display text-sm font-semibold text-mist mb-1">
                      {level.scale}
                    </div>
                    <div
                      className="font-mono text-[9px] uppercase tracking-widest mb-3"
                      style={{ color: 'rgba(0,212,255,0.65)' }}
                    >
                      {level.example}
                    </div>
                    <p className="font-body text-xs text-mist-subtle leading-relaxed">
                      {level.desc}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Horizontal arrow */}
              {i < LEVELS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.13 + 0.35 }}
                  className="flex items-center flex-shrink-0"
                  style={{ transformOrigin: 'left' }}
                >
                  <div
                    className="h-px w-8 lg:w-12"
                    style={{
                      background: 'linear-gradient(90deg, rgba(0,212,255,0.5) 0%, rgba(0,212,255,0.1) 100%)',
                    }}
                  />
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderLeft: '6px solid rgba(0,212,255,0.4)',
                    }}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile — vertical */}
        <div className="md:hidden flex flex-col items-center">
          {LEVELS.map((level, i) => (
            <ScaleNode key={level.id} level={level} index={i} total={LEVELS.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
