import { useEffect, useRef } from 'react';

/**
 * Tracks pointer position two ways simultaneously:
 *
 * 1. Writes raw pixel coords into CSS custom properties (--x, --y) on
 *    document.documentElement, which .cursor-glow (see styles/index.css)
 *    reads via transform. This avoids a React re-render on every
 *    mousemove event — the glow effect is pure CSS/GPU, not JS-driven,
 *    so 60fps cursor tracking doesn't fight with React's render cycle.
 *
 * 2. Maintains a ref (not state) of NORMALIZED coordinates (-1 to 1,
 *    matching Three.js's NDC convention) for the Earth scene's camera
 *    to read imperatively inside its useFrame loop. Also deliberately
 *    not React state — a mesh rotation reading from state would
 *    re-render the whole R3F tree on every pointer move, which is
 *    exactly the kind of "unnecessary render" the prompt's own
 *    Performance section asks to avoid.
 */
export function usePointerPosition() {
  const normalized = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event) {
      document.documentElement.style.setProperty('--x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--y', `${event.clientY}px`);

      normalized.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      normalized.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return normalized;
}
