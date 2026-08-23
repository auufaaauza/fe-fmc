"use client";

import { useEffect, useState } from "react";

/**
 * Hook to automatically hide floating bars on scroll down
 * and show them on scroll up, near the top, or at the bottom of the page.
 */
export function useFloatingBarVisibility(threshold = 60) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateVisibility() {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Always show near the top
      if (currentScrollY <= threshold) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      // Always show when reached the bottom of page
      if (windowHeight + currentScrollY >= documentHeight - 80) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY;

      // Scroll Down -> Hide
      if (diff > 8) {
        setIsVisible(false);
      }
      // Scroll Up -> Show
      else if (diff < -8) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return isVisible;
}
