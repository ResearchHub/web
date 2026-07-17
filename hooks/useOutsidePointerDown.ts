import { RefObject, useEffect } from 'react';

export function useOutsidePointerDown(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [ref, onOutside, enabled]);
}
