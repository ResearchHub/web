import { ApiClient } from './client';
import { ID } from '@/types/root';
import { FeedService } from './feed.service';
import { GrantModerationService, type PendingWorksResponse } from './grant-moderation.service';

export type { PendingWorksResponse };

export type PendingModule = 'funding_opportunities' | 'proposals' | 'posts' | 'journal_entries';

interface PendingModuleConfig {
  /** Plural label shown in the tab. */
  tabLabel: string;
  /** Singular noun used in toasts and the decline modal (e.g. "RFP"). */
  itemLabel: string;
  /**
   * Feed content_type filter and resource base path for the generic flow.
   * Omitted for funding opportunities, which keep their dedicated
   * GrantModerationService (grant_feed + /api/grant) setup.
   */
  feedContentType?: string;
  resourcePath?: string;
}

export const PENDING_MODULES: PendingModule[] = [
  'funding_opportunities',
  'proposals',
  'posts',
  'journal_entries',
];

/** Module shown when none is specified in the URL (the first tab). */
export const DEFAULT_PENDING_MODULE: PendingModule = PENDING_MODULES[0];

/** Maps a module to its URL slug (e.g. "funding_opportunities" → "funding-opportunities"). */
export function moduleToSlug(module: PendingModule): string {
  return module.replace(/_/g, '-');
}

/** Resolves a URL slug back to a module, or undefined when the slug is unknown. */
export function slugToModule(slug: string): PendingModule | undefined {
  const candidate = slug.replace(/-/g, '_') as PendingModule;
  return PENDING_MODULES.includes(candidate) ? candidate : undefined;
}

export const PENDING_MODULE_CONFIG: Record<PendingModule, PendingModuleConfig> = {
  funding_opportunities: {
    tabLabel: 'Funding Opportunities',
    itemLabel: 'RFP',
  },
  proposals: {
    tabLabel: 'Proposals',
    itemLabel: 'Proposal',
    feedContentType: 'PREREGISTRATION',
    resourcePath: '/api/researchhubpost',
  },
  posts: {
    tabLabel: 'Posts',
    itemLabel: 'Post',
    feedContentType: 'POST',
    resourcePath: '/api/researchhubpost',
  },
  journal_entries: {
    tabLabel: 'Journal Entries',
    itemLabel: 'Journal entry',
    feedContentType: 'PAPER',
    resourcePath: '/api/paper',
  },
};

export class PendingModerationError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'PendingModerationError';
  }
}

export class PendingModerationService {
  static async fetchPending(
    module: PendingModule,
    page: number = 1
  ): Promise<PendingWorksResponse> {
    // Grants keep their dedicated feed/endpoint setup.
    if (module === 'funding_opportunities') {
      return GrantModerationService.fetchPendingGrants(page);
    }

    const config = PENDING_MODULE_CONFIG[module];
    try {
      return await FeedService.getFeed({
        endpoint: 'pending_moderation',
        contentType: config.feedContentType,
        page,
      });
    } catch (error) {
      throw new PendingModerationError(
        error instanceof Error ? error.message : `Failed to fetch pending ${config.tabLabel}`,
        error
      );
    }
  }

  static async approve(module: PendingModule, id: ID): Promise<void> {
    if (module === 'funding_opportunities') {
      return GrantModerationService.approveGrant(id);
    }

    const config = PENDING_MODULE_CONFIG[module];
    try {
      await ApiClient.post(`${config.resourcePath}/${id}/approve/`, {});
    } catch (error) {
      throw new PendingModerationError(
        error instanceof Error ? error.message : `Failed to approve ${config.itemLabel}`,
        error
      );
    }
  }

  static async decline(
    module: PendingModule,
    id: ID,
    params: { reason_choice: string; reason?: string }
  ): Promise<void> {
    if (module === 'funding_opportunities') {
      return GrantModerationService.declineGrant(id, params);
    }

    const config = PENDING_MODULE_CONFIG[module];
    try {
      await ApiClient.post(`${config.resourcePath}/${id}/decline/`, params);
    } catch (error) {
      throw new PendingModerationError(
        error instanceof Error ? error.message : `Failed to decline ${config.itemLabel}`,
        error
      );
    }
  }
}
