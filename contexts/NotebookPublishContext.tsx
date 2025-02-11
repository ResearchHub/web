'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { Editor } from '@tiptap/core';
import { FundingFormData } from '@/components/Editor/components/Funding/FundingForm';
import { ArticleType } from '@/components/Editor/components/Sidebar/PublishingSidebar';

interface NotebookPublishState {
  editor: Editor | null;
  title: string;
  articleType: ArticleType;
  fundingData: FundingFormData;
}

interface NotebookPublishContextType extends NotebookPublishState {
  setEditor: (editor: Editor | null) => void;
  setTitle: (title: string) => void;
  setArticleType: (type: ArticleType) => void;
  setFundingData: (data: FundingFormData) => void;
}

const initialState: NotebookPublishState = {
  editor: null,
  title: '',
  articleType: 'research',
  fundingData: {
    budget: '',
    rewardFunders: false,
    nftArt: null,
    nftSupply: '1000',
  },
};

const NotebookPublishContext = createContext<NotebookPublishContextType | null>(null);

export function NotebookPublishProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(initialState.editor);
  const [title, setTitle] = useState(initialState.title);
  const [articleType, setArticleType] = useState<ArticleType>(initialState.articleType);
  const [fundingData, setFundingData] = useState<FundingFormData>(initialState.fundingData);

  const value = {
    editor,
    setEditor,
    title,
    setTitle,
    articleType,
    setArticleType,
    fundingData,
    setFundingData,
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
