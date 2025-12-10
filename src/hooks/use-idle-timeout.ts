'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to detect user inactivity and trigger a callback.
 * @param timeout The inactivity duration in milliseconds.
 * @param onIdle The callback function to execute when the user is idle.
 */
export const useIdleTimeout = (timeout: number, onIdle: () => void) => {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(onIdle, timeout);
  }, [onIdle, timeout]);

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners to track user activity
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
    
    // Initialize the timer
    resetTimer();

    // Cleanup function to remove event listeners and clear the timer
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [resetTimer]);
};
