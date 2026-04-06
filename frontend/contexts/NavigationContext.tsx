"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Direction = 'forward' | 'backward';

const NavigationContext = createContext<Direction>('forward');

export function useNavigationDirection() {
  return useContext(NavigationContext);
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [direction, setDirection] = useState<Direction>('forward');
  // Flag set by popstate (browser back/forward) BEFORE pathname updates
  const isBackNavigationRef = useRef(false);

  useEffect(() => {
    // popstate fires ONLY when browser back/forward buttons are used.
    // Regular link clicks / router.push() do NOT fire this.
    const handlePopState = () => {
      isBackNavigationRef.current = true;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // By the time pathname changes, popstate has already fired (if it was a back nav).
    if (isBackNavigationRef.current) {
      setDirection('backward');
      isBackNavigationRef.current = false;
    } else {
      setDirection('forward');
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={direction}>
      {children}
    </NavigationContext.Provider>
  );
}
