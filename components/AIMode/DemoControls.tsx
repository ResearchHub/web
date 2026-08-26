'use client';

import { Settings, X } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/Switch';
import { useAIMode } from './lib/AIModeContext';

/**
 * Operator-facing switches, deliberately outside the conversation. Beats that
 * aren't ready to show can be turned off between runs without touching the
 * script, so the same build serves an audience that should see delegation and
 * one that shouldn't.
 *
 * Collapsed to a gear by default: the audience is looking at this screen, and a
 * panel discussing what has been hidden from them gives the trick away.
 */
export const DemoControls = () => {
  const { aiDelegationEnabled, actions } = useAIMode();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        aria-label="Open demo controls"
        className="pointer-events-auto absolute bottom-4 right-4 z-10 rounded-full border border-gray-200 bg-white/80 p-2 text-gray-400 shadow-sm transition-colors hover:bg-white hover:text-gray-700"
      >
        <Settings className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-10 w-[248px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Demo controls
        </span>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          aria-label="Close demo controls"
          className="-mr-1 -mt-1 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium leading-tight text-gray-900">
            Offer AI-managed funding
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
            {aiDelegationEnabled
              ? 'The funder is asked whether to delegate disbursement.'
              : 'Hidden. Every disbursement stays supervised.'}
          </p>
        </div>

        <Switch
          checked={aiDelegationEnabled}
          onCheckedChange={actions.setAiDelegationEnabled}
          aria-label="Offer AI-managed funding"
        />
      </div>
    </div>
  );
};
