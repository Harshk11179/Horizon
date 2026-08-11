import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, DASHBOARD_VIEW, SCENE_PHASE } from '@hooks/useAppStore';
import SettingsMenu from './SettingsMenu';

const NAV_LINKS = [
  { label: 'Home',         phase: SCENE_PHASE.HERO },
  { label: 'Earth',        phase: SCENE_PHASE.SCROLLING },
  { label: 'Dashboard',    phase: SCENE_PHASE.DASHBOARD, view: DASHBOARD_VIEW.MISSION_CONTROL },
  { label: 'Citizen',      phase: SCENE_PHASE.DASHBOARD, view: DASHBOARD_VIEW.CITIZEN },
  { label: 'Professional', phase: SCENE_PHASE.DASHBOARD, view: DASHBOARD_VIEW.PROFESSIONAL },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const scenePhase         = useAppStore((s) => s.scenePhase);
  const setScenePhase      = useAppStore((s) => s.setScenePhase);
  const setActiveDashboard = useAppStore((s) => s.setActiveDashboardView);
  const clearSelected      = useAppStore((s) => s.clearSelectedLocation);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleNavClick(link) {
    setMobileOpen(false);
    if (link.phase === SCENE_PHASE.HERO) {
      clearSelected();
      setScenePhase(SCENE_PHASE.HERO);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.phase === SCENE_PHASE.SCROLLING) {
      setScenePhase(SCENE_PHASE.HERO);
      window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' });
    } else if (link.phase === SCENE_PHASE.DASHBOARD) {
      setScenePhase(SCENE_PHASE.DASHBOARD);
      if (link.view) setActiveDashboard(link.view);
    }
  }

  const isActive = (link) => scenePhase === link.phase;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        transition: 'background 0.5s ease, backdrop-filter 0.5s ease',
        background: scrolled
          ? 'linear-gradient(180deg,rgba(7,12,24,0.92) 0%,rgba(7,12,24,0.75) 100%)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(1.5)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}
    >
      {/* Scrolled top-edge glow line */}
      {scrolled && (
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg,transparent 0%,rgba(0,212,255,0.5) 30%,rgba(79,142,255,0.35) 70%,transparent 100%)',
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Wordmark */}
        <button
          onClick={() => handleNavClick({ phase: SCENE_PHASE.HERO })}
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: 'conic-gradient(from 180deg,#00D4FF,#4F8EFF,#00F5A0,#00D4FF)',
              padding: '1.5px',
            }}
          >
            <div className="w-full h-full rounded-full bg-void-950 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neon-blue"
                style={{ boxShadow: '0 0 8px rgba(0,212,255,0.9)' }} />
            </div>
          </div>
          <span className="font-display text-lg font-semibold tracking-wide text-mist group-hover:text-glow-white transition-all duration-300">
            Horizon
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="relative px-4 py-2 rounded-full font-body text-sm tracking-wide transition-colors duration-300"
                style={{ color: active ? '#EDF6FF' : '#9AB3CC' }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#EDF6FF'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#9AB3CC'; }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'linear-gradient(135deg,rgba(0,212,255,0.12),rgba(79,142,255,0.08))',
                      border: '1px solid rgba(0,212,255,0.28)',
                      boxShadow: '0 0 14px rgba(0,212,255,0.18)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <SettingsMenu />
          <button
            className="md:hidden p-2 text-mist-dim hover:text-mist transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 w-0' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(7,12,24,0.97)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`text-left px-4 py-2.5 rounded-xl font-body text-sm transition-colors duration-200 ${
                    isActive(link)
                      ? 'text-neon-blue bg-neon-blue/[0.08]'
                      : 'text-mist-dim hover:text-mist'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
