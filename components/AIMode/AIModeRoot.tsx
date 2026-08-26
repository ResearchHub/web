'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAIMode } from './lib/AIModeContext';

/**
 * The overlay body carries the transcript, the real proposal cards and the
 * document renderer, so it stays out of the initial bundle until first open.
 */
const AIModeOverlay = dynamic(
  () => import('./AIModeOverlay').then((module) => module.AIModeOverlay),
  { ssr: false }
);

export const AIModeRoot = () => {
  const { isOpen, actions } = useAIMode();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        actions.toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  if (!isOpen) return null;

  return <AIModeOverlay />;
};
