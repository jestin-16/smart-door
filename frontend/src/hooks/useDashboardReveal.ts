import { useEffect, useRef } from 'react';

/** Reveal offscreen sections once, while keeping content visible without observer support. */
export function useDashboardReveal() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root.current || motion.matches || !('IntersectionObserver' in window)) return;

    const elements = Array.from(root.current.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    for (const element of elements) {
      // Initial content uses its entrance animation; only defer content below the fold.
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.classList.add('scroll-reveal');
        observer.observe(element);
      }
    }
    const revealAll = () => {
      if (motion.matches) {
        elements.forEach(element => element.classList.add('is-revealed'));
        observer.disconnect();
      }
    };
    motion.addEventListener('change', revealAll);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', revealAll);
      elements.forEach(element => element.classList.remove('scroll-reveal', 'is-revealed'));
    };
  }, []);

  return root;
}
