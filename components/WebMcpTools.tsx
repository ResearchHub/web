'use client';

import { useEffect } from 'react';
import { SearchService } from '@/services/search.service';

interface ModelContext {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      execute: (input: { query: string }) => Promise<unknown>;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
    },
    options: { signal: AbortSignal }
  ): Promise<void>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  // Older Chrome builds expose WebMCP on navigator instead of document.
  interface Navigator {
    modelContext?: ModelContext;
  }
}

/**
 * Exposes site search to in-browser AI agents through WebMCP.
 */
const WebMcpTools = () => {
  useEffect(() => {
    const modelContext = document.modelContext ?? navigator.modelContext;
    if (!modelContext) return;

    const controller = new AbortController();
    void modelContext.registerTool(
      {
        name: 'search_researchhub',
        description: 'Search ResearchHub for researchers and posts such as proposals and grants.',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string', description: 'Search terms' } },
          required: ['query'],
        },
        execute: async ({ query }) => {
          const suggestions = await SearchService.getSuggestions(query);
          return suggestions.map(({ entityType, displayName, url }) => ({
            entityType,
            displayName,
            url,
          }));
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
      },
      { signal: controller.signal }
    );
    return () => controller.abort();
  }, []);

  return null;
};

export default WebMcpTools;
