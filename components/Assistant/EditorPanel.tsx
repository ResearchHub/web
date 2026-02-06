'use client';

import React, { useState, useCallback } from 'react';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';
import type { Editor } from '@tiptap/core';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';

interface EditorPanelProps {
  field: string;
  initialContent: string;
  onConfirm: (json: object) => void;
  onDiscard: () => void;
}

function formatFieldLabel(field: string): string {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  field,
  initialContent,
  onConfirm,
  onDiscard,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const editorReady = !!editor;

  const handleSetEditor = useCallback((ed: Editor | null) => {
    setEditor(ed);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!editor) return;
    const json = editor.getJSON();
    onConfirm(json);
  }, [editor, onConfirm]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-800">{formatFieldLabel(field)}</span>
          <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            AI Draft
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDiscard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600
              border border-gray-200 rounded-lg
              hover:bg-gray-100 active:scale-[0.98] transition-all"
          >
            <X size={12} />
            Discard
          </button>
          <button
            onClick={handleConfirm}
            disabled={!editorReady}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white
              bg-primary-600 rounded-lg
              hover:bg-primary-700 active:scale-[0.98] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editorReady ? <Check size={12} /> : <Loader2 size={12} className="animate-spin" />}
            Confirm
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 min-h-full">
          <BlockEditor
            content={initialContent || '<p></p>'}
            editable={true}
            requireTitle={false}
            setEditor={handleSetEditor}
          />
        </div>
      </div>
    </div>
  );
};
