'use client';

import { BriefcaseBusiness } from 'lucide-react';
import { useOptionalAIMode } from '@/components/AIMode/AIModeContext';
import { AI_MODE_NAME } from '@/components/AIMode/copy';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

/** The top bar's door into the workspace: always its new-conversation screen. */
export function TopBarWorkspaceButton() {
  const aiMode = useOptionalAIMode();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  if (!aiMode) return null;

  return (
    <button
      type="button"
      onClick={() => executeAuthenticatedAction(() => aiMode.selectChat(null))}
      aria-label={AI_MODE_NAME}
      title={AI_MODE_NAME}
      className="flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
    >
      <BriefcaseBusiness size={28} strokeWidth={1.75} className="text-gray-500" />
    </button>
  );
}
