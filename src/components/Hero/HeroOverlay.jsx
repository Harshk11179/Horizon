import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, SCENE_PHASE } from '@hooks/useAppStore';
import Navbar from '@components/Navbar/Navbar';
import ScrollParallaxLayer from './ScrollParallaxLayer';

/**
 * Intro sequence timing. Each stage's delay is tuned so the overall
 * effect reads as "fade in from black... [several seconds]... buttons
 * animate upward" as one continuous unfolding sequence rather than a
 * single fade — see the brief's explicit staged list (stars, Earth,
 * atmosphere, clouds, sunlight, title, subtitle, buttons).
 *
 * The 3D layer (stars/Earth/atmosphere/clouds) is already continuously
 * rendering underneath — it doesn't "wait" for this sequence. What
 * fades in stage-by-stage is this DOM layer's own opacity/blur, timed
 * so the DARK OVERLAY covering the 3D scene lifts gradually, revealing
 * stars first, then more of the scene, rather than the 3D content
 * itself being staged (which would require coordinating opacity across
 * many separate WebGL materials — needlessly complex compared to
 * revealing what's already rendering via a single DOM overlay fade).
 */
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
    return () => timers.forEach(clearTimeout);
  }, []);

  const veilOpacity = stage === 'BLACK' ? 1 : stage === 'STARS_REVEALED' ? 0.55 : 0;

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-void-950 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: veilOpacity }}
      transition={{ duration: stage === 'STARS_REVEALED' ? 1.2 : 1.8, ease: 'easeOut' }}
    />
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const riseVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * LiquidButton
 *
 * "Glowing liquid hover animations" per the brief — implemented as a
 * radial gradient that expands from the cursor's position within the
 * button on hover (tracked via onMouseMove + CSS custom properties,
 * same technique as the global cursor-glow, for the same
 * no-React-state-on-mousemove performance reason) rather than a
 * uniform glow, which reads as flat/generic rather than "liquid."
 */
function LiquidButton({ children, variant = 'primary', onClick }) {
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  const base =
    'relative overflow-hidden px-8 py-3.5 rounded-full font-display text-sm tracking-wide transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]';

  const variantClass =
    variant === 'primary'
      ? 'bg-neon-blue/10 border border-neon-blue/40 text-mist shadow-glow-blue'
      : 'bg-white/[0.04] border border-white/15 text-mist-dim hover:text-mist';

  return (
    <button
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`${base} ${variantClass} group`}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(140px circle at var(--mx, 50%) var(--my, 50%), rgba(0,217,255,0.35), transparent 70%)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

/**
 * HeroOverlay
 *
 * Renders the intro veil, navbar, hero text/buttons, AND the tall
 * scroll-spacer that gives the document actual scrollable height.
 * Without a real-height element somewhere in the DOM, window.scrollY
 * would always be 0 and useScrollProgress would have nothing to
 * measure — the Canvas layer itself is fixed/full-viewport (see
 * EarthExperience.jsx) and contributes zero scrollHeight on its own.
 *
 * 300vh chosen empirically: long enough that the scroll-driven camera
 * zoom (SCROLL_MIN_DISTANCE -> SCROLL_MAX_DISTANCE in CameraRig.jsx)
 * has room to feel gradual rather than completing in a single mouse-
 * wheel tick, short enough that reaching the dashboard doesn't require
 * excessive scrolling.
 */
export default function HeroOverlay() {
  const scenePhase = useAppStore((state) => state.scenePhase);
  const setScenePhase = useAppStore((state) => state.setScenePhase);

  const heroVisible = scenePhase === SCENE_PHASE.HERO || scenePhase === SCENE_PHASE.SCROLLING;

  function handleExploreEarth() {
    // "Explore Earth" scrolls the user into the scroll-driven zoom
    // sequence rather than jumping straight to a location — it's the
    // brief's own distinction between the two hero buttons ("Explore
    // Earth" vs "Enter Dashboard").
    window.scrollTo({ top: window.innerHeight * 1.2, behavior: 'smooth' });
  }

  function handleEnterDashboard() {
    setScenePhase(SCENE_PHASE.DASHBOARD);
  }

  return (
    <>
      <IntroVeil />
      <Navbar />

      {/* Wrapping div gives ScrollParallaxLayer's `absolute inset-0`
          something sized to the full scroll sequence to anchor
          against, rather than the layer collapsing to 0 height (which
          `absolute` positioning would do with no positioned ancestor
          of nonzero height) — the hero section below and the 300vh
          spacer at the bottom of this component are its siblings, all
          contained here. */}
      <div className="relative">
        <ScrollParallaxLayer />

        <section className="relative h-screen w-full flex flex-col items-center justify-center px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroVisible ? 'visible' : 'hidden'}
            className="flex flex-col items-center text-center max-w-3xl"
          >
            <motion.h1
              variants={riseVariants}
              className="font-display font-medium text-6xl md:text-8xl text-mist text-glow-blue tracking-tight"
            >
              EcoSentinel
            </motion.h1>

            <motion.p
              variants={riseVariants}
              className="mt-5 font-body text-lg md:text-xl text-mist-dim tracking-wide"
            >
              Real-Time Planetary Health Intelligence
            </motion.p>

            <motion.div variants={riseVariants} className="mt-10 flex items-center gap-4">
              <LiquidButton variant="primary" onClick={handleExploreEarth}>
                Explore Earth
              </LiquidButton>
              <LiquidButton variant="secondary" onClick={handleEnterDashboard}>
                Enter Dashboard
              </LiquidButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: heroVisible ? 1 : 0 }}
            transition={{ delay: 3.8, duration: 1 }}
            className="absolute bottom-10 flex flex-col items-center gap-2 text-mist-dim"
          >
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-mist-dim to-transparent" />
          </motion.div>
        </section>

        {/* Scroll-driven zoom sequence spacer — see component doc comment
            above. Sibling of the hero <section>, both children of the
            relative wrapper that gives ScrollParallaxLayer's absolute
            positioning something to size against. */}
        <div className="h-[300vh] w-full pointer-events-none" aria-hidden="true" />
      </div>
    </>
  );
}
