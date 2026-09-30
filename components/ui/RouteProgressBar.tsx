'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function RouteProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<'idle' | 'running' | 'completing'>('idle');
  const [progress, setProgress] = useState(0);

  // Complete progress bar when pathname or searchParams change
  useEffect(() => {
    if (state === 'running') {
      setProgress(100);
      setState('completing');
      const timer = setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Listen for clicks on internal navigation links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !target.hasAttribute('download') &&
        target.getAttribute('target') !== '_blank'
      ) {
        try {
          const url = new URL(href, window.location.origin);
          if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
            setProgress(35);
            setState('running');
            setTimeout(() => {
              setProgress((prev) => (prev === 35 ? 75 : prev));
            }, 180);
          }
        } catch {
          // invalid url ignored
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (state === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] bg-transparent"
    >
      <div
        className="h-full bg-seedly-primary transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: state === 'completing' ? 0 : 1,
          transitionProperty: 'width, opacity',
        }}
      />
    </div>
  );
}

export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <RouteProgressBarInner />
    </Suspense>
  );
}
