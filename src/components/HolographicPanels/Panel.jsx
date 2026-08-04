import { motion } from 'framer-motion';

/**
 * Panel
 *
 * "Floating glass panels animate into place. Cards slide from
 * different directions... Hover elevation. Glow intensity changes." —
 * this is the single shared implementation of that behavior. Built
 * once here rather than per-view so MissionControl/Citizen/Professional
 * panels all feel like the same design system instead of three
 * slightly-different hand-rolled card components.
 *
 * @param {'left'|'right'|'up'|'down'} from - slide-in direction
 * @param {number} delay - stagger delay in seconds
 * @param {'default'|'risk'|'good'} tone - border/glow color variant
 */
const SLIDE_OFFSETS = {
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
  up: { x: 0, y: -40 },
  down: { x: 0, y: 40 },
};

const TONE_CLASSES = {
  default: 'hover:border-neon-blue/40 hover:shadow-glow-blue',
  good: 'hover:border-emerald-glow/40 hover:shadow-glow-emerald',
  risk: 'hover:border-risk/40 hover:shadow-glow-risk',
};

export default function Panel({
  children,
  from = 'up',
  delay = 0,
  tone = 'default',
  className = '',
  as: Component = motion.div,
}) {
  const offset = SLIDE_OFFSETS[from];

  return (
    <Component
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`glass-panel p-5 border transition-colors duration-300 ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </Component>
  );
}
