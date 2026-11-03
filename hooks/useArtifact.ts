'use client';

import { useEffect, useState } from 'react';
import { ArtifactService } from '@/services/artifact.service';
import type { Artifact } from '@/types/artifact';

// A version never changes once written, so one fetch per version per page load
// is enough, however often a viewer reopens it.
const versionCache = new Map<string, Artifact>();

interface ArtifactState {
  artifact: Artifact | null;
  loading: boolean;
  error: boolean;
}

/** Version `version` of artifact `id`; null `id` loads nothing. */
export function useArtifact(id: number | null, version: number | null): ArtifactState {
  const key = id == null || version == null ? null : `${id}:${version}`;
  const [fetched, setFetched] = useState<{ key: string; artifact: Artifact | null } | null>(null);

  useEffect(() => {
    if (key == null || id == null || version == null || versionCache.has(key)) return;
    let cancelled = false;
    ArtifactService.getArtifact(id, version)
      .then((artifact) => {
        versionCache.set(key, artifact);
        if (!cancelled) setFetched({ key, artifact });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key, artifact: null });
      });
    return () => {
      cancelled = true;
    };
  }, [key, id, version]);

  if (key == null) return { artifact: null, loading: false, error: false };
  const cached = versionCache.get(key);
  if (cached) return { artifact: cached, loading: false, error: false };
  if (fetched?.key !== key) return { artifact: null, loading: true, error: false };
  return { artifact: fetched.artifact, loading: false, error: fetched.artifact == null };
}
