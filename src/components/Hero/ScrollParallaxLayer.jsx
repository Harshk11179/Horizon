import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrollParallaxLayer
 *
 * "Parallax movement. Animated gradients. Floating icons." — this is
 * a DOM-layer effect, deliberately separate from the 3D scene's own
 * SpaceDust/Starfield (which already provide 3D-space depth via the
 * WebGL camera). This layer adds small glassmorphic glyph-like shapes
 * that drift at DIFFERENT rates than the page scroll itself, which is
 * the actual definition of parallax (elements closer to the "camera"
 * — i.e. higher in the DOM stacking, larger scale — move faster than
 * the background).
 *
 * Uses framer-motion's useScroll + useTransform rather than a manual
 * scroll listener, since this is purely a presentational scroll-tied
 * effect with no cross-component state dependency (unlike
 * useScrollProgress.js, which feeds the 3D camera and genuinely needs
 * to live in the shared store) — framer-motion's scroll utilities are
 * already optimized for exactly this kind of transform-only,
 * store-independent scroll binding.
 */
const ICONS = [
  { symbol: '◈', top: '12%', left: '8%', size: 22, speedFactor: 0.15, color: '#00D9FF' },
  { symbol: '○', top: '22%', left: '88%', size: 16, speedFactor: 0.3, color: '#00FFA3' },
  { symbol: '◇', top: '48%', left: '5%', size: 18, speedFactor: 0.22, color: '#00D9FF' },
  { symbol: '△', top: '68%', left: '92%', size: 20, speedFactor: 0.35, color: '#00FFA3' },
  { symbol: '◈', top: '78%', left: '15%', size: 14, speedFactor: 0.18, color: '#00D9FF' },
  { symbol: '○', top: '35%', left: '95%', size: 12, speedFactor: 0.4, color: '#00D9FF' },
];

function ParallaxIcon({ icon, scrollYProgress }) {
  // Each icon travels a different vertical distance as the page
  // scrolls, proportional to its own speedFactor — this is what
  // creates the depth illusion, rather than every element moving at
  // the same rate as a single group.
  const y = useTransform(scrollYProgress, [0, 1], [0, -400 * icon.speedFactor]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 0.5, 0.5, 0]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: icon.top,
        left: icon.left,
        fontSize: icon.size,
        color: icon.color,
        y,
        opacity,
        textShadow: `0 0 12px ${icon.color}66`,
      }}
      aria-hidden="true"
      className="select-none"
    >
      {icon.symbol}
    </motion.div>
  );
}

/**
 * ScrollParallaxLayer
 *
 * Mounted once, as a child of HeroOverlay's `relative` wrapper div
 * (which contains both the h-screen hero section and the 300vh
 * scroll-spacer). Deliberately has NO explicit height of its own —
 * `absolute inset-0` sizes it against that parent's actual rendered
 * height. An earlier version hardcoded `h-[400vh]` here to match the
 * hero+spacer total, which meant two files each had to independently
 * agree on the same number — a silent coupling that would break the
 * moment either changed. Let the parent's real height drive this
 * instead of asserting a duplicate of it.
 *
 * pointer-events-none throughout since these are purely decorative —
 * they should never intercept clicks meant for the globe markers or
 * hero buttons sitting in the same viewport region.
 */
export default function ScrollParallaxLayer() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {ICONS.map((icon, i) => (
        <ParallaxIcon key={i} icon={icon} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}
