import {
  EXPERTISE_LEVEL_OPTIONS,
  getRegionLabel,
  type ExpertiseLevel,
  type Region,
} from '@/services/expertFinder.service';
import type { ExpertSearchResult } from '@/types/expertFinder';
import { getSearchEngine, getSearchEngineLabel } from '@/app/expert-finder/lib/searchEngine';

export interface SearchConfigLineItem {
  label: string;
  value: string;
}

function expertiseLevelLabel(value: string): string {
  return EXPERTISE_LEVEL_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function formatExpertiseLevels(raw: unknown): string {
  const values: string[] = Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    : typeof raw === 'string' && raw.trim() !== ''
      ? [raw.trim()]
      : [];
  const specific = values.filter((value) => value !== 'all_levels') as ExpertiseLevel[];
  if (specific.length === 0) return 'All';
  return specific.map(expertiseLevelLabel).join(', ');
}

function formatRegion(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const region = raw.trim() as Region;
  if (region === 'all_regions') return 'All';
  return getRegionLabel(region);
}

/** Engine, expertise level, and region from search config, for the detail meta line. */
export function getSearchConfigLineItems(search: ExpertSearchResult): SearchConfigLineItem[] {
  const config = search.config ?? {};
  const items: SearchConfigLineItem[] = [];

  items.push({
    label: 'Engine',
    value: getSearchEngineLabel(getSearchEngine(config)),
  });

  items.push({ label: 'Expertise Level', value: formatExpertiseLevels(config.expertise_level) });

  const region = formatRegion(config.region);
  if (region) {
    items.push({ label: 'Region', value: region });
  }

  return items;
}
