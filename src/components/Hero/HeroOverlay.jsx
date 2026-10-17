import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, SCENE_PHASE } from '@hooks/useAppStore';
import Navbar from '@components/Navbar/Navbar';
import ScrollParallaxLayer from './ScrollParallaxLayer';
import LandingPage from '@components/Landing/LandingPage';

const INTRO_STAGES = {
  BLACK: 0,
  STARS_REVEALED: 400,
  EARTH_REVEALED: 1400,
  TITLE_IN: 2600,
  SUBTITLE_IN: 3100,
  BUTTONS_IN: 3500,
  COMPLETE: 4000,
};

function IntroVeil() {
  const [stage, setStage] = useState('BLACK');

  useEffect(() => {
    const timers = Object.entries(INTRO_STAGES)
      .filter(([key]) => key !== 'BLACK')
      .map(([key, delay]) => setTimeout(() => setStage(key), delay));

    const phaseTimer = setTimeout(() => {
      const { scenePhase, setScenePhase } = useAppStore.getState();
      if (scenePhase === SCENE_PHASE.INTRO) setScenePhase(SCENE_PHASE.HERO);
    }, INTRO_STAGES.COMPLETE);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(phaseTimer);
    };
  }, []);

  const veilOpacity = stage === 'BLACK' ? 1 : stage === 'STARS_REVEALED' ? 0.55 : 0;

  return (
    <motion.div
      className="fixed inset-0 z-40 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: veilOpacity }}
      transition={{ duration: stage === 'STARS_REVEALED' ? 1.2 : 1.8, ease: 'easeOut' }}
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #02040A 0%, #000000 100%)' }}
    />
  );
}

/**
 * LiquidButton — magnetic hover + radial ripple from cursor position.
 */
function LiquidButton({ children, variant = 'primary', onClick }) {
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  if (variant === 'primary') {
    return (
      <button
        onMouseMove={handleMouseMove}
        onClick={onClick}
        className="relative overflow-hidden px-8 py-3.5 rounded-full font-display text-sm tracking-wide text-mist group"
        style={{
          background: 'linear-gradient(135deg,rgba(0,212,255,0.14),rgba(79,142,255,0.10))',
          border: '1px solid rgba(0,212,255,0.38)',
          boxShadow: '0 0 24px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
          transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.45), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)';
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
          e.currentTarget.style.borderColor = 'rgba(0,212,255,0.65)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 24px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)';
          e.currentTarget.style.transform = '';
          e.currentTarget.style.borderColor = 'rgba(0,212,255,0.38)';
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(160px circle at var(--mx,50%) var(--my,50%),rgba(0,212,255,0.3),transparent 70%)',
          }}
        />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }

  return (
    <button
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className="relative overflow-hidden px-8 py-3.5 rounded-full font-display text-sm tracking-wide text-mist-dim group"
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
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(140px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,0.08),transparent 70%)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export default function HeroOverlay() {
  const scenePhase    = useAppStore((s) => s.scenePhase);
  const setScenePhase = useAppStore((s) => s.setScenePhase);

  const heroVisible = scenePhase === SCENE_PHASE.HERO || scenePhase === SCENE_PHASE.SCROLLING;

  function handleExploreEarth() {
    window.scrollTo({ top: window.innerHeight * 1.2, behavior: 'smooth' });
  }
  function handleEnterDashboard() {
    setScenePhase(SCENE_PHASE.DASHBOARD);
  }

  return (
    <>
      <IntroVeil />
      <Navbar />

      <div className="relative">
        <ScrollParallaxLayer />

        <section className="relative h-screen w-full flex flex-col items-center justify-center px-6">
          <AnimatePresence>
            {heroVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center max-w-4xl"
              >
                {/* Eyebrow label */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2 mb-6"
                >
                  <span className="w-6 h-px bg-neon-blue/60" />
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.25em]"
                    style={{ color: 'rgba(0,212,255,0.8)' }}
                  >
                    Start Exploring
                  </span>
                  <span className="w-6 h-px bg-neon-blue/60" />
                </motion.div>

                {/* Main heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.75, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-body text-xl text-mist-dim tracking-wide leading-relaxed max-w-2xl mb-10"
                >
                  From planetary health to local decisions, Horizon turns environmental
                  data into intelligence you can act on.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4"
                >
                  <LiquidButton variant="primary" onClick={handleExploreEarth}>
                    Explore Earth
                  </LiquidButton>
                  <LiquidButton variant="secondary" onClick={handleEnterDashboard}>
                    Enter Dashboard
                  </LiquidButton>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4.3, duration: 1 }}
                  className="flex items-center gap-8 mt-14"
                >
                  {[
                    { value: '12', label: 'Countries' },
                    { value: '36', label: 'Cities' },
                    { value: '6', label: 'Indicators' },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <div className="font-mono text-2xl font-medium tabular-nums"
                        style={{ color: '#EDF6FF' }}>
                        {value}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-mist-subtle mt-0.5">
                        {label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: heroVisible ? 1 : 0 }}
            transition={{ delay: 4.5, duration: 1 }}
            className="absolute bottom-10 flex flex-col items-center gap-2"
          >
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-mist-subtle">
              Scroll
            </span>
            <div className="relative w-px h-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/60 to-transparent" />
              <motion.div
                className="absolute top-0 left-0 w-full h-1/2 bg-neon-blue"
                animate={{ y: ['0%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </section>

        {/* 150vh spacer (reduced per user request) — drives Earth camera zoom via useScrollProgress.
             landing content follows below. */}
        <div className="h-[150vh] w-full pointer-events-none" aria-hidden="true" />

        {/* Landing page sections — only shown during hero / scrolling phase */}
        {heroVisible && <LandingPage />}
      </div>
    </>
  );
}
