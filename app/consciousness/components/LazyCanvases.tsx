'use client';

import dynamic from 'next/dynamic';
import type { SceneId } from '../data/content';

// The figure code loads after first paint, in its own chunk; until then (and
// whenever it cannot run) the server-rendered still is what shows.
const LiveFigure = dynamic(() => import('./LiveFigure'), { ssr: false });
const HeroCanvasLive = dynamic(() => import('./HeroCanvas'), { ssr: false });

export function FigureCanvas({ sceneId }: { sceneId: SceneId }) {
  return <LiveFigure sceneId={sceneId} />;
}

export function HeroCanvas() {
  return <HeroCanvasLive />;
}
