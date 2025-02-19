'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { Editor } from '@tiptap/core';
import { ID } from '@/types/root';

interface NotebookPublishState {
  editor: Editor | null;
  noteId: ID;
}

interface NotebookPublishContextType extends NotebookPublishState {
  setEditor: (editor: Editor | null) => void;
  setNoteId: (id: ID) => void;
}

const initialState: NotebookPublishState = {
  editor: null,
  noteId: null,
};

const NotebookPublishContext = createContext<NotebookPublishContextType | null>(null);

export function NotebookPublishProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(initialState.editor);
  const [noteId, setNoteId] = useState<ID | null>(initialState.noteId);

  const value = {
    editor,
    setEditor,
    noteId,
    setNoteId,
  };

  return (
    <NotebookPublishContext.Provider value={value}>{children}</NotebookPublishContext.Provider>
  );
}

export function useNotebookPublish() {
  const context = useContext(NotebookPublishContext);
  if (!context) {
    throw new Error('useNotebookPublish must be used within a NotebookPublishProvider');
  }
  return context;
}
