'use client';

import React, { useState, useCallback } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import type { Editor } from '@tiptap/core';
import { BaseModal } from '@/components/ui/BaseModal';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';

interface AssistantNoteEditorModalProps {
  isOpen: boolean;
  title?: string;
  content?: string;
  contentJson?: string;
  onConfirm: (json: object, html: string) => void;
  onDiscard: () => void;
}

export const AssistantNoteEditorModal: React.FC<AssistantNoteEditorModalProps> = ({
  isOpen,
  title = 'Description',
  content,
  contentJson,
  onConfirm,
  onDiscard,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const editorReady = !!editor;

  const handleConfirm = useCallback(() => {
    if (!editor) return;
    onConfirm(editor.getJSON(), editor.getHTML());
  }, [editor, onConfirm]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onDiscard}
      showCloseButton={false}
      maxWidth="max-w-4xl"
      padding="p-0"
      title={title}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onDiscard}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600
              border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <X size={14} />
            Discard
          </button>
          <button
            onClick={handleConfirm}
            disabled={!editorReady}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
              bg-primary-600 rounded-lg hover:bg-primary-700 active:scale-[0.98] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editorReady ? <Check size={14} /> : <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div style={{ minHeight: '60vh' }}>
        <BlockEditor
          content={content}
          contentJson={contentJson}
          editable={true}
          requireTitle={false}
          setEditor={setEditor}
        />
      </div>
    </BaseModal>
  );
};
