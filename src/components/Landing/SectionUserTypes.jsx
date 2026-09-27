import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from '@hooks/useAppStore';

const CITIZEN_FEATURES = [
  { icon: '🏡', label: 'Environmental Score', value: '78/100', color: '#00F5A0', status: 'good' },
  { icon: '🌬', label: 'Air Quality', value: 'AQI 52', color: '#00D4FF', status: 'moderate' },
  { icon: '💧', label: 'Water Stress', value: 'Low', color: '#00F5A0', status: 'good' },
  { icon: '🌿', label: 'Green Cover', value: '34%', color: '#00F5A0', status: 'good' },
  { icon: '📈', label: 'Environmental Trend', value: 'Improving', color: '#00F5A0', status: 'good' },
  { icon: '♻', label: 'Eco Recommendations', value: '4 active', color: '#00D4FF', status: 'moderate' },
];

const PROFESSIONAL_FEATURES = [
  { icon: '📍', label: 'Site Assessment', value: 'Moderate', color: '#F59E0B', status: 'moderate' },
  { icon: '💧', label: 'Water Stress', value: 'High', color: '#FF3B5C', status: 'risk' },
  { icon: '🌾', label: 'Land Condition', value: 'Degraded', color: '#F59E0B', status: 'moderate' },
  { icon: '🦋', label: 'Biodiversity', value: 'Sensitive', color: '#FF3B5C', status: 'risk' },
  { icon: '🌊', label: 'Disaster Risk', value: 'Moderate', color: '#F59E0B', status: 'moderate' },
  { icon: '📋', label: 'Sustainability Score', value: '61/100', color: '#F59E0B', status: 'moderate' },
];

const STATUS_COLORS = {
  good: '#00F5A0',
  moderate: '#F59E0B',
  risk: '#FF3B5C',
};

function FeatureRow({ feature, index }) {
  const statusColor = STATUS_COLORS[feature.status] ?? '#00D4FF';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.07, duration: 0.5 }}
      className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-sm">{feature.icon}</span>
        <span className="font-body text-sm text-mist-dim">{feature.label}</span>
      </div>
      <span
        className="font-mono text-xs font-medium tabular-nums px-2 py-0.5 rounded-full"
        style={{
          color: statusColor,
          background: `${statusColor}12`,
          border: `1px solid ${statusColor}25`,
        }}
      >
        {feature.value}
      </span>
    </motion.div>
  );
}

export default function SectionUserTypes() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });
  const setScenePhase = useAppStore((s) => s.setScenePhase);
  const setActiveDashboardView = useAppStore((s) => s.setActiveDashboardView);

  function handleCitizen() {
    setActiveDashboardView(DASHBOARD_VIEW.CITIZEN);
    setScenePhase(SCENE_PHASE.DASHBOARD);
  }

  function handleProfessional() {
    setActiveDashboardView(DASHBOARD_VIEW.PROFESSIONAL);
    setScenePhase(SCENE_PHASE.DASHBOARD);
  }

  return (
    <section
      id="user-types"
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
              Who Is Horizon For?
            </span>
            <span className="w-8 h-px bg-neon-blue/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-mist leading-tight mb-5"
          >
            Two ways to use{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #00F5A0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Horizon.
            </span>
          </motion.h2>
        </div>

        {/* Two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Citizen Card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl p-7 flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,160,0.06) 0%, rgba(11,17,32,0.9) 50%, rgba(7,12,24,0.95) 100%)',
              border: '1px solid rgba(0,245,160,0.15)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,160,0.4), transparent)' }}
            />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(0,245,160,0.1) 0%, transparent 70%)' }}
            />

            {/* Label */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 self-start"
              style={{ background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.25)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-glow">
                Citizen
              </span>
            </div>

            <div className="font-display text-2xl font-semibold text-mist mb-2">
              Understand the place you call home.
            </div>
            <p className="font-body text-sm text-mist-dim leading-relaxed mb-6">
              Get a complete environmental profile of your neighborhood — from air quality
              to flood risk — explained in plain language with personalized recommendations.
            </p>

            {/* Feature list */}
            <div className="flex-1 mb-6">
              {CITIZEN_FEATURES.map((f, i) => (
                <FeatureRow key={f.label} feature={f} index={i} />
              ))}
            </div>

            <button
              onClick={handleCitizen}
              className="w-full py-3.5 rounded-2xl font-display text-sm tracking-wide text-mist transition-all duration-400"
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,160,0.15), rgba(0,212,255,0.08))',
                border: '1px solid rgba(0,245,160,0.35)',
                boxShadow: '0 0 20px rgba(0,245,160,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 32px rgba(0,245,160,0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,160,0.15)';
                e.currentTarget.style.transform = '';
              }}
            >
              Explore Citizen →
            </button>
          </motion.div>

          {/* Professional Card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl p-7 flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(79,142,255,0.06) 0%, rgba(11,17,32,0.9) 50%, rgba(7,12,24,0.95) 100%)',
              border: '1px solid rgba(79,142,255,0.15)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(79,142,255,0.4), transparent)' }}
            />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(79,142,255,0.08) 0%, transparent 70%)' }}
            />

            {/* Label */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 self-start"
              style={{ background: 'rgba(79,142,255,0.1)', border: '1px solid rgba(79,142,255,0.25)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-electric" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-electric">
                Professional
              </span>
            </div>

            <div className="font-display text-2xl font-semibold text-mist mb-2">
              Make better decisions before development begins.
            </div>
            <p className="font-body text-sm text-mist-dim leading-relaxed mb-6">
              Environmental due diligence for planners, developers, and engineers. Get site
              suitability assessments with risk analysis before any investment.
            </p>

            {/* Feature list */}
            <div className="flex-1 mb-6">
              {PROFESSIONAL_FEATURES.map((f, i) => (
                <FeatureRow key={f.label} feature={f} index={i} />
              ))}
            </div>

            <button
              onClick={handleProfessional}
              className="w-full py-3.5 rounded-2xl font-display text-sm tracking-wide text-mist transition-all duration-400"
              style={{
                background: 'linear-gradient(135deg, rgba(79,142,255,0.15), rgba(0,212,255,0.08))',
                border: '1px solid rgba(79,142,255,0.35)',
                boxShadow: '0 0 20px rgba(79,142,255,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 32px rgba(79,142,255,0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(79,142,255,0.15)';
                e.currentTarget.style.transform = '';
              }}
            >
              Explore Professional →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
