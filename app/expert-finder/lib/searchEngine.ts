import {
  normalizeSearchEngine,
  type ExpertSearchEngine,
} from '@/services/expertFinder.service';

/** Read engine from search config; missing/legacy → advanced. */
export function getSearchEngine(
  config: Record<string, unknown> | null | undefined
): ExpertSearchEngine {
  return normalizeSearchEngine(config?.engine);
}

export function getSearchEngineLabel(engine: ExpertSearchEngine): string {
  return engine === 'basic' ? 'Basic' : 'Advanced';
}

/** True when the API/SSE error text records an agent content_filtered stop. */
export function isContentFilteredError(message: string | null | undefined): boolean {
  if (typeof message !== 'string' || !message.trim()) return false;
  return /content[_ ]?filtered/i.test(message);
}
