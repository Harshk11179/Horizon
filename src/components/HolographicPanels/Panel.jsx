import { motion } from 'framer-motion';

/**
 * Panel — premium glass card primitive.
 * Layered gradient glass + shimmer highlight + directional slide-in.
 * tone: 'default' | 'good' | 'risk'
 */

const SLIDE_OFFSETS = {
  left:  { x: -32, y: 0 },
  right: { x: 32,  y: 0 },
  up:    { x: 0,   y: -32 },
  down:  { x: 0,   y: 32 },
};

const TONE_STYLES = {
  default: {
    border:    'rgba(255,255,255,0.08)',
    hoverBorder: 'rgba(0,212,255,0.28)',
    glow:      '0 0 0 0 transparent',
    hoverGlow: '0 0 24px rgba(0,212,255,0.14)',
    shimmer:   'rgba(0,212,255,0.06)',
  },
  good: {
    border:    'rgba(0,245,160,0.15)',
    hoverBorder: 'rgba(0,245,160,0.40)',
    glow:      '0 0 16px rgba(0,245,160,0.06)',
    hoverGlow: '0 0 28px rgba(0,245,160,0.18)',
    shimmer:   'rgba(0,245,160,0.06)',
  },
  risk: {
    border:    'rgba(255,59,92,0.18)',
    hoverBorder: 'rgba(255,59,92,0.40)',
    glow:      '0 0 16px rgba(255,59,92,0.08)',
    hoverGlow: '0 0 28px rgba(255,59,92,0.2)',
    shimmer:   'rgba(255,59,92,0.06)',
  },
};

export default function Panel({
  children,
  from = 'up',
  delay = 0,
  tone = 'default',
  className = '',
  as: Component = motion.div,
  onClick,
}) {
  const offset = SLIDE_OFFSETS[from];
  const ts = TONE_STYLES[tone] ?? TONE_STYLES.default;
  const isClickable = !!onClick;

  return (
    <Component
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.22 } }}
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-2xl ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'linear-gradient(135deg,rgba(11,17,32,0.72) 0%,rgba(7,12,24,0.88) 100%)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        border: `1px solid ${ts.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.42),0 2px 8px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.055),${ts.glow}`,
        transition: 'border-color 0.3s ease,box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = ts.hoverBorder;
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5),0 4px 14px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.07),${ts.hoverGlow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = ts.border;
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.42),0 2px 8px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.055),${ts.glow}`;
      }}
    >
      {/* Top-left glass shine */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 55%)`,
        }}
      />
      {/* Tone-colored shimmer streak */}
      <div
        className="absolute top-0 left-0 w-full h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg,transparent 0%,${ts.shimmer.replace('0.06', '0.5')} 40%,transparent 100%)`,
          opacity: 0.6,
        }}
      />
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
