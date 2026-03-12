import { useState, useEffect } from 'react';

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const canvasSize = isMobile
    ? Math.min(280, window.innerWidth * 0.85)
    : 300;

  return { isMobile, canvasSize };
}
