import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from '@hooks/useAppStore';

const REPORT_SECTIONS = [
  {
    id: 'score',
    label: 'Environmental Health Score',
    value: '71',
    sub: 'out of 100',
    color: '#F59E0B',
    type: 'score',
  },
  {
    id: 'risk',
    label: 'Risk Analysis',
    items: [
      { name: 'Flood Risk', level: 'Moderate', color: '#F59E0B' },
      { name: 'Air Quality Risk', level: 'Low', color: '#00F5A0' },
      { name: 'Water Stress', level: 'High', color: '#FF3B5C' },
      { name: 'Heat Risk', level: 'Moderate', color: '#F59E0B' },
    ],
    type: 'risks',
  },
  {
    id: 'trends',
    label: 'Environmental Trends',
    sparkData: [55, 57, 60, 58, 62, 65, 63, 67, 68, 70, 71, 71],
    color: '#00D4FF',
    type: 'trend',
    trendLabel: '+16 pts over 12 months',
  },
  {
    id: 'recs',
    label: 'Recommendations',
    items: [
      'Install rooftop solar + rainwater harvesting',
      'Increase green cover by 15% over 3 years',
      'Upgrade stormwater drainage infrastructure',
    ],
    type: 'list',
  },
];

function MiniSparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 160;
  const h = 32;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 6) - 3}`)
    .join(' ');

  return (
    <svg width={w} height={h}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}66)` }}
      />
    </svg>
  );
}

const STATUS_COLORS = {
  Low: '#00F5A0',
  Moderate: '#F59E0B',
  High: '#FF3B5C',
};

function ReportCard() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, rgba(11,17,32,0.97), rgba(7,12,24,0.99))',
        border: '1px solid rgba(0,212,255,0.12)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
      }}
    >
      {/* Report header */}
      <div
        className="px-6 py-4 border-b border-white/[0.07]"
        style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.04) 0%, transparent 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'conic-gradient(from 180deg,#00D4FF,#4F8EFF,#00F5A0,#00D4FF)',
                  padding: '1px',
                }}
              >
                <div className="w-full h-full rounded-full bg-void-900" />
              </div>
              <span className="font-display text-sm font-semibold text-mist tracking-wide">
                Horizon
              </span>
            </div>
            <div className="font-mono text-[10px] text-mist-subtle uppercase tracking-widest">
              Environmental Assessment Report
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] text-mist-subtle">Location</div>
            <div className="font-display text-sm font-medium text-mist">Pune, India</div>
          </div>
        </div>
      </div>

      {/* Report sections */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_SECTIONS.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-mist-subtle mb-3">
              {section.label}
            </div>

            {section.type === 'score' && (
              <div className="flex items-end gap-2">
                <span className="font-mono text-4xl font-bold" style={{ color: section.color }}>
                  {section.value}
                </span>
                <span className="font-mono text-sm text-mist-subtle mb-1">{section.sub}</span>
              </div>
            )}

            {section.type === 'risks' && (
              <div className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="font-body text-xs text-mist-dim">{item.name}</span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        color: STATUS_COLORS[item.level],
                        background: `${STATUS_COLORS[item.level]}12`,
                        border: `1px solid ${STATUS_COLORS[item.level]}25`,
                      }}
                    >
                      {item.level}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'trend' && (
              <div>
                <MiniSparkline data={section.sparkData} color={section.color} />
                <div
                  className="font-mono text-xs mt-1 tabular-nums"
                  style={{ color: section.color }}
                >
                  {section.trendLabel}
                </div>
              </div>
            )}

            {section.type === 'list' && (
              <div className="flex flex-col gap-2">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-glow mt-0.5 text-xs flex-shrink-0">✓</span>
                    <span className="font-body text-xs text-mist-dim leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Watermark */}
      <div className="px-5 pb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-neon-blue/40" />
        <span className="font-mono text-[10px] text-mist-subtle tracking-wide">
          Report generated by Horizon AI · Demo preview
        </span>
      </div>
    </div>
  );
}

export default function SectionReport() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, amount: 0.5 });
  const setScenePhase = useAppStore((s) => s.setScenePhase);
  const setActiveDashboard = useAppStore((s) => s.setActiveDashboardView);

  function handleOpen() {
    setActiveDashboard(DASHBOARD_VIEW.PROFESSIONAL);
    setScenePhase(SCENE_PHASE.DASHBOARD);
  }

  return (
    <section
      id="report"
      className="relative w-full py-28 px-6"
      style={{
        background: 'transparent',
      }}
    >
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div ref={headingRef}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="w-8 h-px bg-neon-blue/40" />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-blue/70">
                Environmental Reports
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-semibold text-4xl md:text-5xl text-mist leading-tight mb-5"
            >
              Get a complete{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00D4FF 0%, #00F5A0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                environmental report.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-body text-lg text-mist-dim leading-relaxed mb-8"
            >
              Horizon generates comprehensive environmental assessment reports —
              covering health scores, risk analysis, trend data, and actionable
              recommendations — for any location on Earth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col gap-4 mb-8"
            >
              {[
                { icon: '📊', text: 'Environmental Health Score with trend analysis' },
                { icon: '⚠', text: 'Multi-factor risk assessment across 6 indicators' },
                { icon: '🎯', text: 'Actionable sustainability recommendations' },
                { icon: '📄', text: 'Exportable PDF for planning and compliance' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={headingInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.07, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">{f.icon}</span>
                  <span className="font-body text-sm text-mist-dim">{f.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <button
                onClick={handleOpen}
                className="relative overflow-hidden px-8 py-3.5 rounded-full font-display text-sm tracking-wide text-mist"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.14), rgba(79,142,255,0.10))',
                  border: '1px solid rgba(0,212,255,0.38)',
                  boxShadow: '0 0 24px rgba(0,212,255,0.25)',
                  transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.45), 0 8px 32px rgba(0,0,0,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(0,212,255,0.25)';
                  e.currentTarget.style.transform = '';
                }}
              >
                Generate Environmental Report →
              </button>
            </motion.div>
          </div>

          {/* Right — report preview */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <ReportCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
