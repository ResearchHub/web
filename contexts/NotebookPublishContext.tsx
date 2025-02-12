'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { Editor } from '@tiptap/core';
import { FundingFormData } from '@/components/Editor/components/Funding/FundingForm';
import { ID } from '@/types/root';

export type ArticleType = 'research' | 'preregistration' | 'other';

interface NotebookPublishState {
  editor: Editor | null;
  articleType: ArticleType;
  fundingData: FundingFormData | null;
  noteId: ID;
}

interface NotebookPublishContextType extends NotebookPublishState {
  setEditor: (editor: Editor | null) => void;
  setArticleType: (type: ArticleType) => void;
  setFundingData: (data: FundingFormData) => void;
  setNoteId: (id: ID) => void;
}

const initialState: NotebookPublishState = {
  editor: null,
  articleType: 'research',
  fundingData: null,
  noteId: null,
};

const NotebookPublishContext = createContext<NotebookPublishContextType | null>(null);

export function NotebookPublishProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(initialState.editor);
  const [articleType, setArticleType] = useState<ArticleType>(initialState.articleType);
  const [fundingData, setFundingData] = useState<FundingFormData | null>(initialState.fundingData);
  const [noteId, setNoteId] = useState<ID | null>(initialState.noteId);

  const value = {
    editor,
    setEditor,
    articleType,
    setArticleType,
    fundingData,
    setFundingData,
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
