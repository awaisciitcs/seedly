'use client';

import { useRef, type PointerEvent } from 'react';

/**
 * useTilt Hook - Smooth mouse-tracked 3D tilt and glare coordinates.
 * Dispatches --rx, --ry, --mx, --my CSS variables via requestAnimationFrame.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxDeg = 5) {
  const raf = useRef(0);

  return {
    onPointerMove(e: PointerEvent<T>) {
      if (e.pointerType !== 'mouse') return;
      const el = e.currentTarget;
      const { clientX, clientY } = e;

      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (clientX - r.left) / r.width;
        const y = (clientY - r.top) / r.height;

        el.style.setProperty('--ry', `${(x - 0.5) * 2 * maxDeg}deg`);
        el.style.setProperty('--rx', `${(0.5 - y) * 2 * maxDeg}deg`);
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
      });
    },
    onPointerLeave(e: PointerEvent<T>) {
      cancelAnimationFrame(raf.current);
      const el = e.currentTarget;
      for (const p of ['--rx', '--ry', '--mx', '--my']) {
        el.style.removeProperty(p);
      }
    },
  };
}
