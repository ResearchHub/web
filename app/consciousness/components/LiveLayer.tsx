'use client';

import dynamic from 'next/dynamic';
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { cn } from '@/utils/styles';
import type { SetId } from '../theme';
import {
  isPosterOnly,
  type FigureId,
  type LiveFigureProps,
  type PosterFigureId,
} from '../sets/types';
import type { HeroId } from '../sets/heroes';

// Each set's library loads in its own chunk, only when that set is shown.
const PosterLive = dynamic(() => import('../sets/poster/PosterLive'), { ssr: false });
const LIVE: Record<Exclude<SetId, 'ink' | 'poster'>, ComponentType<LiveFigureProps>> = {
  clay: dynamic(() => import('../sets/clay/ClayLive'), { ssr: false }),
  spectral: dynamic(() => import('../sets/spectral/SpectralLive'), { ssr: false }),
  engraved: dynamic(() => import('../sets/engraved/EngravedLive'), { ssr: false }),
  micrograph: dynamic(() => import('../sets/micrograph/MicrographLive'), { ssr: false }),
};

/** If a set's figure throws, drop it and leave the static image showing. */
class FigureBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('Orch OR figure failed; showing its still instead.', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

let webglOk: boolean | null = null;
function hasWebGl() {
  if (webglOk === null) {
    try {
      const c = document.createElement('canvas');
      webglOk = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webglOk = false;
    }
  }
  return webglOk;
}

/**
 * The live layer of a set's figure, over its static image. It mounts the
 * set's module only while the figure is on (or near) the screen and
 * unmounts it shortly after it leaves, which pauses it and frees its WebGL
 * context (the gallery shows 18 of them). With reduced motion, without
 * WebGL, or with `?orch-gl=off`, it never mounts and the static image is
 * the figure. `?orch-capture=1` mounts it at once and draws one still frame.
 */
export function LiveLayer({
  set,
  fig,
  hero,
}: {
  set: Exclude<SetId, 'ink'>;
  fig: PosterFigureId;
  hero?: HeroId;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'off' | 'live' | 'capture'>('off');
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('orch-capture') === '1') {
      setMode('capture');
      setNear(true);
      return;
    }
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      q.get('orch-motion') === 'reduce';
    // The Engraved set is Canvas 2D and runs without WebGL.
    const needsGl = set !== 'engraved';
    if (reduced || (needsGl && (q.get('orch-gl') === 'off' || !hasWebGl()))) return;
    setMode('live');

    const el = ref.current;
    if (!el) return;
    let leave = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(leave);
        if (entry.isIntersecting) setNear(true);
        else
          leave = window.setTimeout(() => {
            setNear(false);
            setReady(false);
          }, 900);
      },
      { rootMargin: '160px 0px' }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(leave);
    };
  }, [set]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-live={mode !== 'off' && near ? (ready ? 'ready' : 'loading') : 'off'}
      className={cn(
        'absolute inset-0 transition-opacity duration-700',
        ready ? 'opacity-100' : 'opacity-0'
      )}
    >
      {mode !== 'off' && near && (
        <FigureBoundary>
          {set === 'poster' || isPosterOnly(fig) ? (
            <PosterLive fig={fig} hero={hero} still={mode === 'capture'} onReady={onReady} />
          ) : (
            <OtherLive
              set={set}
              fig={fig as FigureId}
              hero={hero}
              still={mode === 'capture'}
              onReady={onReady}
            />
          )}
        </FigureBoundary>
      )}
    </div>
  );
}

/** One of the sets other than Poster, which draw the shared figures only. */
function OtherLive({ set, ...props }: LiveFigureProps & { set: Exclude<SetId, 'ink' | 'poster'> }) {
  const Live = LIVE[set];
  return <Live {...props} />;
}
