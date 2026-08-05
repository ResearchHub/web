'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FeatureFlag, isFeatureEnabled, setFeatureOverride } from '@/utils/featureFlags';

/** `?assistant=1` opts this browser in, `?assistant=0` opts back out. */
const ASSISTANT_PARAM = 'assistant';

/**
 * Whether the notebook assistant is switched on for this browser.
 *
 * The parameter is sticky: it writes a localStorage override rather than
 * gating on the query string itself, because opening another note replaces
 * the URL and would otherwise drop the feature mid-test.
 */
export function useNotebookAssistantFlag(): boolean {
  const searchParams = useSearchParams();
  const param = searchParams?.get(ASSISTANT_PARAM) ?? null;

  // Resolved after mount, never during render: the flag lives in
  // localStorage, so answering on the server would render a tree that
  // hydration then contradicts.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (param === '1') {
      setFeatureOverride(FeatureFlag.NotebookChatAssistant, true);
    } else if (param === '0') {
      setFeatureOverride(FeatureFlag.NotebookChatAssistant, false);
    }
    setEnabled(isFeatureEnabled(FeatureFlag.NotebookChatAssistant));
  }, [param]);

  return enabled;
}
