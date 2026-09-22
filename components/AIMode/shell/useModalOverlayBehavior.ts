'use client';

import { useEffect } from 'react';

/**
 * A modal that portals outside the overlay (BaseModal, a drawer) is showing.
 * Closed drawers stay mounted off-screen with `role="dialog"`, so presence in
 * the DOM is not enough — the box has to intersect the viewport.
 */
function isForeignDialogOpen(overlay: HTMLElement): boolean {
  return Array.from(document.querySelectorAll('[role="dialog"]')).some((el) => {
    if (overlay.contains(el)) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth
    );
  });
}

interface ModalOverlayBehaviorOptions {
  /** The overlay's root; nothing happens until it is mounted. */
  readonly rootEl: HTMLElement | null;
  readonly onEscape: () => void;
}

/**
 * What makes a full-viewport overlay a real modal: it takes focus, everything
 * else at the top level goes inert while it is open (so nothing behind it —
 * a notebook editor that autofocuses late, say — can take focus or keys),
 * the page behind it stops scrolling, and Esc closes it unless something
 * inside already claimed the key (a menu, a modal that portals outside).
 * Layers that mount later (menus, tooltips, modals) append after and stay
 * live; the overlay's own drawers render inside it.
 */
export function useModalOverlayBehavior({ rootEl, onEscape }: ModalOverlayBehaviorOptions) {
  useEffect(() => {
    if (!rootEl) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (isForeignDialogOpen(rootEl)) return;
      onEscape();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [rootEl, onEscape]);

  useEffect(() => {
    if (!rootEl) return;
    rootEl.focus();
    const inerted: Element[] = [];
    for (const child of Array.from(document.body.children)) {
      if (child === rootEl || child.tagName === 'SCRIPT' || child.tagName === 'NEXTJS-PORTAL') {
        continue;
      }
      if (child.hasAttribute('inert')) continue;
      child.setAttribute('inert', '');
      inerted.push(child);
    }
    return () => {
      for (const child of inerted) child.removeAttribute('inert');
    };
  }, [rootEl]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
}
