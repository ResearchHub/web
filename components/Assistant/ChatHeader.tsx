'use client';

import React, { useState } from 'react';
import { Sparkles, PenLine, ClipboardList } from 'lucide-react';
import type { AssistantRole, FieldUpdate } from '@/types/assistant';
import { getFieldsForRole, countCompleted } from './lib/fieldDefinitions';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { AssistantProgress } from './AssistantProgress';

interface ChatHeaderProps {
  role: AssistantRole;
  fieldState: Record<string, FieldUpdate>;
  editorOpen?: boolean;
  onToggleEditor?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  role,
  fieldState,
  editorOpen,
  onToggleEditor,
}) => {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const { required } = getFieldsForRole(role);
  const { completed, total } = countCompleted(fieldState, required);
  const title = role === 'funder' ? 'Funding Assistant' : 'Proposal Assistant';

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
            <Sparkles size={18} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">
              {completed} of {total} required fields
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile-only progress button */}
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setShowProgressModal(true)}
            className="right-sidebar:!hidden"
          >
            <ClipboardList size={13} />
            <span className="hidden mobile:!inline ml-1.5">
              {completed}/{total}
            </span>
          </Button>

          {/* Editor toggle */}
          {onToggleEditor && (
            <Button size="sm" onClick={onToggleEditor}>
              <PenLine size={13} />
              <span className="ml-1.5">Show Editor</span>
            </Button>
          )}
        </div>
      </div>

      <BaseModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title="Progress"
        maxWidth="max-w-md"
        padding="p-0"
      >
        <AssistantProgress role={role} fieldState={fieldState} />
      </BaseModal>
    </>
  );
};
