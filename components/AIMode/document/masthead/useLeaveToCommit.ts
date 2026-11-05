'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `onLeave` when the user clicks or tabs out of an editor. A widget's
 * editor is taller than the line it becomes, so leaving on blur would shift
 * the page between the press and the release of the very click that caused
 * it, and the click would land on something else. This waits for the click
 * to finish.
 */
export function useLeaveToCommit(ref: RefObject<HTMLElement | null>, onLeave: () => void) {
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;

  useEffect(() => {
    const isInside = (target: EventTarget | null) =>
      target instanceof Node && Boolean(ref.current?.contains(target));

    let pointerDown = false;
    let pressedOutside = false;
    const handlePointerDown = (event: PointerEvent) => {
      pointerDown = true;
      pressedOutside = !isInside(event.target);
    };
    const handleClick = (event: MouseEvent) => {
      // A drag that began inside (selecting text) and ended outside is not a click away.
      const leaving = pressedOutside && !isInside(event.target);
      pointerDown = false;
      pressedOutside = false;
      if (leaving) onLeaveRef.current();
    };
    // Focus moved out by the keyboard; a pointer's focus change is the click's to handle.
    const handleFocusIn = (event: FocusEvent) => {
      if (!pointerDown && !isInside(event.target)) onLeaveRef.current();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('focusin', handleFocusIn, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('focusin', handleFocusIn, true);
    };
  }, [ref]);
}
