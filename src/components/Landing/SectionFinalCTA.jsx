import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from '@hooks/useAppStore';

export default function SectionFinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const setScenePhase = useAppStore((s) => s.setScenePhase);
  const setActiveDashboard = useAppStore((s) => s.setActiveDashboardView);

  function handleExploreEarth() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenDashboard() {
    setActiveDashboard(DASHBOARD_VIEW.MISSION_CONTROL);
    setScenePhase(SCENE_PHASE.DASHBOARD);
  }

  return (
    <section
      id="final-cta"
      ref={ref}
      className="relative w-full py-32 px-6 overflow-hidden"
      style={{
        background: 'transparent',
      }}
    >
      {/* Background globe glow */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, rgba(0,212,255,0.02) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[300, 450, 600].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              border: `1px solid rgba(0,212,255,${0.04 - i * 0.01})`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 60 + i * 20, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <span className="w-8 h-px bg-neon-blue/40" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-blue/70">
            Start Exploring
          </span>
          <span className="w-8 h-px bg-neon-blue/40" />
        </motion.div>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-semibold text-5xl md:text-6xl lg:text-7xl text-mist leading-[1.05] tracking-tight mb-6"
        >
          Understand the environment.{' '}
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #00D4FF 0%, #00F5A0 60%, #4F8EFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Act before it&apos;s too late.
          </span>
        </motion.h2>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-xl text-mist-dim max-w-2xl mx-auto leading-relaxed mb-12"
        >
          From planetary health to local decisions, Horizon turns environmental
          data into intelligence you can act on.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <button
            onClick={handleExploreEarth}
            className="relative overflow-hidden px-10 py-4 rounded-full font-display text-base tracking-wide text-mist group"
            style={{
              background: 'linear-gradient(135deg,rgba(0,212,255,0.14),rgba(79,142,255,0.10))',
              border: '1px solid rgba(0,212,255,0.38)',
              boxShadow: '0 0 32px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
              transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 48px rgba(0,212,255,0.5), 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.65)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 32px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.38)';
            }}
          >
            🌍 Explore Earth
          </button>

          <button
            onClick={handleOpenDashboard}
            className="px-10 py-4 rounded-full font-display text-base tracking-wide text-mist-dim"
            style={{
              border: '1px solid rgba(255,255,255,0.12)',
              transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EDF6FF';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.background = '';
              e.currentTarget.style.transform = '';
            }}
          >
            Open Dashboard
          </button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20 pt-10 border-t border-white/[0.06] grid grid-cols-3 gap-8 max-w-xl mx-auto"
        >
          {[
            { value: '12+', label: 'Countries' },
            { value: '36+', label: 'Cities monitored' },
            { value: '6', label: 'Data sources' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div
                className="font-mono text-2xl font-semibold tabular-nums mb-1"
                style={{ color: '#EDF6FF' }}
              >
                {value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-mist-subtle">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
