import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from '@hooks/useAppStore';

const NAV_LINKS = [
  { label: 'Earth', scrollTop: true },
  { label: 'Dashboard', view: DASHBOARD_VIEW.MISSION_CONTROL },
  { label: 'Citizen', view: DASHBOARD_VIEW.CITIZEN },
  { label: 'Professional', view: DASHBOARD_VIEW.PROFESSIONAL },
];

const DATA_SOURCES = [
  { name: 'NASA', href: 'https://nasa.gov' },
  { name: 'NOAA', href: 'https://noaa.gov' },
  { name: 'CPCB', href: 'https://cpcb.nic.in' },
  { name: 'Satellite Data', href: '#' },
];

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const setScenePhase = useAppStore((s) => s.setScenePhase);
  const setActiveDashboardView = useAppStore((s) => s.setActiveDashboardView);

  function handleNav(link) {
    if (link.scrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveDashboardView(link.view);
      setScenePhase(SCENE_PHASE.DASHBOARD);
    }
  }

  return (
    <footer
      ref={ref}
      className="relative w-full"
      style={{
        background: 'rgba(2,4,10,1)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.25) 30%, rgba(0,245,160,0.15) 70%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12"
        >
          {/* Brand column */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: 'conic-gradient(from 180deg,#00D4FF,#4F8EFF,#00F5A0,#00D4FF)',
                  padding: '1.5px',
                }}
              >
                <div className="w-full h-full rounded-full bg-void-950 flex items-center justify-center">
                  <div
                    className="w-2 h-2 rounded-full bg-neon-blue"
                    style={{ boxShadow: '0 0 8px rgba(0,212,255,0.9)' }}
                  />
                </div>
              </div>
              <span className="font-display text-lg font-semibold text-mist tracking-wide">
                Horizon
              </span>
            </div>

            <p className="font-body text-sm text-mist-subtle leading-relaxed max-w-xs">
              Real-time environmental intelligence for a changing planet.
            </p>

            {/* Status indicator */}
            <div
              className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(0,245,160,0.05)',
                border: '1px solid rgba(0,245,160,0.15)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-glow/70">
                Systems Operational
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist-subtle mb-5">
              Navigation
            </div>
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNav(link)}
                  className="text-left font-body text-sm text-mist-dim hover:text-mist transition-colors duration-300 w-fit"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data sources */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist-subtle mb-5">
              Technology & Data
            </div>
            <div className="flex flex-col gap-3">
              {DATA_SOURCES.map((src) => (
                <a
                  key={src.name}
                  href={src.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-mist-dim hover:text-mist transition-colors duration-300 w-fit"
                >
                  {src.name}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <span className="font-mono text-[11px] text-mist-subtle tracking-wide">
            © 2026 Horizon · Environmental Intelligence Platform
          </span>
          <span className="font-mono text-[11px] text-mist-subtle/60 tracking-wide text-center">
            Data shown is for demonstration — real-time integration via NASA, NOAA &amp; CPCB in progress
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
