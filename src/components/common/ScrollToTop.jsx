import { useLayoutEffect, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Try to scroll before paint
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Multiple aggressive scroll attempts
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (window.scrollY !== 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    // Immediate
    scrollToTop();

    // Multiple delayed attempts
    const timeouts = [
      setTimeout(scrollToTop, 0),
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 150),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
