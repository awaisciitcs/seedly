'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Connection = EventTarget & { saveData?: boolean };
interface Props {
  children: ReactNode;
  className?: string;
  strength?: number;
  layer?: ReactNode;
}

// The outer surface stays still; only its visual plane follows the pointer.
export function DepthSurface({ children, className = '', strength = 4, layer }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = ref.current;
    if (!surface || typeof window.matchMedia !== 'function') return;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const limit = Number.isFinite(strength) ? Math.min(Math.max(strength, 0), 7) : 4;
    let frame: number | null = null;
    let clientX = 0;
    let clientY = 0;
    let enabled = false;

    const reset = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      delete surface.dataset.depthActive;
      for (const property of ['--depth-rx', '--depth-ry', '--depth-x', '--depth-y']) {
        surface.style.removeProperty(property);
      }
    };

    const refresh = () => {
      enabled = pointer.matches && !motion.matches && !connection?.saveData && !document.hidden;
      surface.dataset.depthEnabled = String(enabled);
      reset();
    };

    const draw = () => {
      frame = null;
      if (!enabled || !surface.isConnected || surface.contains(document.activeElement)) return;
      const bounds = surface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)) * 2 - 1;
      const y = Math.min(1, Math.max(0, (clientY - bounds.top) / bounds.height)) * 2 - 1;
      surface.style.setProperty('--depth-rx', (-y * limit).toFixed(2) + 'deg');
      surface.style.setProperty('--depth-ry', (x * limit).toFixed(2) + 'deg');
      surface.style.setProperty('--depth-x', x.toFixed(3));
      surface.style.setProperty('--depth-y', y.toFixed(3));
      surface.dataset.depthActive = 'true';
    };

    const move = (event: PointerEvent) => {
      if (!enabled || event.pointerType !== 'mouse' || surface.contains(document.activeElement)) return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame === null) frame = requestAnimationFrame(draw);
    };

    refresh();
    surface.addEventListener('pointermove', move, { passive: true });
    surface.addEventListener('pointerleave', reset);
    surface.addEventListener('pointercancel', reset);
    surface.addEventListener('pointerdown', reset);
    surface.addEventListener('focusin', reset);
    pointer.addEventListener('change', refresh);
    motion.addEventListener('change', refresh);
    connection?.addEventListener?.('change', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      reset();
      delete surface.dataset.depthEnabled;
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerleave', reset);
      surface.removeEventListener('pointercancel', reset);
      surface.removeEventListener('pointerdown', reset);
      surface.removeEventListener('focusin', reset);
      pointer.removeEventListener('change', refresh);
      motion.removeEventListener('change', refresh);
      connection?.removeEventListener?.('change', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [strength]);

  return <div ref={ref} className={'depth-surface ' + className}>
    <div className="depth-surface-plane">
      <div className="depth-surface-visual">{children}</div>
      <span className="depth-surface-sheen" aria-hidden="true" />
      {layer && <div className="depth-surface-layer">{layer}</div>}
    </div>
  </div>;
}
