'use client';

import React, { useState } from 'react';
import { Sparkles, PenLine, X, ClipboardList } from 'lucide-react';
import type { AssistantRole, FieldUpdate } from '@/types/assistant';
import { getFieldsForRole, countCompleted } from './lib/fieldDefinitions';
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
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
            <Sparkles size={18} className="text-indigo-600" />
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
          <button
            onClick={() => setShowProgressModal(true)}
            className="right-sidebar:!hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600
              border border-gray-200 rounded-lg
              hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <ClipboardList size={13} />
            <span className="hidden mobile:!inline">
              {completed}/{total}
            </span>
          </button>

          {/* Editor toggle */}
          {onToggleEditor && (
            <button
              onClick={onToggleEditor}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                active:scale-[0.98] transition-all
                ${
                  editorOpen
                    ? 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                    : 'text-white bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
              {editorOpen ? (
                <>
                  <X size={13} />
                  Close Editor
                </>
              ) : (
                <>
                  <PenLine size={13} />
                  Editor
                </>
              )}
            </button>
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
