'use client';

import { createElement, useEffect, useRef, type HTMLAttributes } from 'react';

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article';
  delay?: number;
  stagger?: boolean;
}

// Content is visible in server-rendered HTML and when motion is unavailable.
export function Reveal({ as = 'div', children, className = '', delay = 0, stagger = false, ...props }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;

    // Never hide content already in view, including the LCP image.
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) return;
    if (element.contains(document.activeElement)) return;

    const siblingIndex = element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : 0;
    const wait = stagger ? (siblingIndex % 4) * 55 : Math.min(Math.max(delay, 0), 160);
    element.style.setProperty('--reveal-delay', wait + 'ms');

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        element.dataset.reveal = 'visible';
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px 24px 0px', threshold: 0 });

    const revealImmediately = () => {
      element.dataset.reveal = 'idle';
      observer.disconnect();
    };
    const handlePreference = () => {
      if (preference.matches) revealImmediately();
    };
    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.target === element) element.dataset.reveal = 'idle';
    };

    observer.observe(element);
    element.dataset.reveal = 'pending';
    element.addEventListener('focusin', revealImmediately);
    element.addEventListener('animationend', handleAnimationEnd);
    preference.addEventListener('change', handlePreference);

    return () => {
      revealImmediately();
      element.style.removeProperty('--reveal-delay');
      element.removeEventListener('focusin', revealImmediately);
      element.removeEventListener('animationend', handleAnimationEnd);
      preference.removeEventListener('change', handlePreference);
    };
  }, [delay, stagger]);

  return createElement(as, { ...props, ref, className: 'reveal ' + className, 'data-reveal': 'idle' }, children);
}