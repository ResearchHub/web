'use client';

import { useEffect } from 'react';
import { SearchService } from '@/services/search.service';

// WebMCP (webmachinelearning.github.io/webmcp) is a draft browser API that lets
// AI agents running in the browser call tools a page registers. TypeScript's DOM
// types don't include it yet, so the part used here is declared by hand.
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
 *
 * This is frontend only: WebMCP tools exist only while a page is open in a
 * browser that supports the API. It is separate from a backend MCP server, which
 * agents connect to directly without loading the site, and neither replaces the
 * other.
 */
const WebMcpTools = () => {
  useEffect(() => {
    // Most browsers don't support WebMCP yet; there it does nothing.
    const modelContext = document.modelContext ?? navigator.modelContext;
    if (!modelContext) return;

    // Aborting the signal unregisters the tool, which the cleanup below does on unmount.
    const controller = new AbortController();
    void modelContext.registerTool(
      {
        // The name, description, and inputSchema are what the agent reads to
        // decide when to call the tool and what arguments to pass.
        name: 'search_researchhub',
        description: 'Search ResearchHub for researchers and posts such as proposals and grants.',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string', description: 'Search terms' } },
          required: ['query'],
        },
        // Runs only when an agent calls the tool, never on page load. Reuses the
        // site's existing search endpoint. Results are trimmed to what an agent
        // needs, because the browser JSON-stringifies the return value and the
        // full models also carry the raw API payload on `.raw`.
        execute: async ({ query }) => {
          const suggestions = await SearchService.getSuggestions(query);
          return suggestions.map(({ entityType, displayName, url }) => ({
            entityType,
            displayName,
            url,
          }));
        },
        // readOnlyHint: searching changes nothing, so agents can call it without
        // asking the user. untrustedContentHint: results include user-written
        // titles, so agents shouldn't follow instructions found in them.
        annotations: { readOnlyHint: true, untrustedContentHint: true },
      },
      { signal: controller.signal }
    );
    return () => controller.abort();
  }, []);

  return null;
};

export default WebMcpTools;
