import { useEffect, useRef } from 'react';

export const useAutoFocus = <T extends HTMLElement>(shouldFocus: boolean = true) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      // Small delay to ensure the element is fully rendered
      const timeoutId = setTimeout(() => {
        elementRef.current?.focus();
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocus]);

  return elementRef;
};
