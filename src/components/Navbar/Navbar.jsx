import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, DASHBOARD_VIEW, SCENE_PHASE } from '@hooks/useAppStore';

const NAV_LINKS = [
  { label: 'Home', phase: SCENE_PHASE.HERO },
  { label: 'Earth', phase: SCENE_PHASE.SCROLLING },
  { label: 'Dashboard', phase: SCENE_PHASE.DASHBOARD, view: DASHBOARD_VIEW.MISSION_CONTROL },
  { label: 'Citizen', phase: SCENE_PHASE.DASHBOARD, view: DASHBOARD_VIEW.CITIZEN },
  { label: 'Professional', phase: SCENE_PHASE.DASHBOARD, view: DASHBOARD_VIEW.PROFESSIONAL },
];

/**
 * Navbar
 *
 * "Transparent. Blurred. Floating... Navbar should change appearance
 * while scrolling" — tracked via a local scroll listener rather than
 * reading useAppStore's scrollProgress, since that value is 0-1 across
 * the ENTIRE 300vh hero scroll spacer (see HeroOverlay.jsx) and this
 * only needs a much coarser signal: "has the page scrolled past
 * effectively zero, yes or no" — a boolean threshold check on raw
 * window.scrollY is simpler and avoids subscribing this always-visible
 * component to a store value that changes on every animation frame
 * during the scroll sequence, which would re-render the navbar 60
 * times a second for a value it only uses as a threshold.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const scenePhase = useAppStore((state) => state.scenePhase);
  const setScenePhase = useAppStore((state) => state.setScenePhase);
  const setActiveDashboardView = useAppStore((state) => state.setActiveDashboardView);
  const clearSelectedLocation = useAppStore((state) => state.clearSelectedLocation);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleNavClick(link) {
    if (link.phase === SCENE_PHASE.HERO) {
      clearSelectedLocation();
      setScenePhase(SCENE_PHASE.HERO);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.phase === SCENE_PHASE.SCROLLING) {
      setScenePhase(SCENE_PHASE.HERO);
      window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' });
    } else if (link.phase === SCENE_PHASE.DASHBOARD) {
      setScenePhase(SCENE_PHASE.DASHBOARD);
      if (link.view) setActiveDashboardView(link.view);
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.6, duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-void-950/70 backdrop-blur-lg border-b border-white/[0.06]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => handleNavClick({ phase: SCENE_PHASE.HERO })}
          className="font-display text-lg text-mist tracking-wide"
        >
          EcoSentinel
        </button>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className={`font-body text-sm tracking-wide transition-colors duration-300 ${
                scenePhase === link.phase ? 'text-neon-blue' : 'text-mist-dim hover:text-mist'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
