import { createContext, useContext, useState, ReactNode } from 'react';
import { Editor } from '@tiptap/core';
import { FundingFormData } from '@/components/Editor/components/Funding/FundingForm';
import { ArticleType } from '@/components/Editor/components/Sidebar/PublishingSidebar';

interface NotebookPublishContextType {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  title: string;
  setTitle: (title: string) => void;
  articleType: ArticleType;
  setArticleType: (type: ArticleType) => void;
  fundingData: FundingFormData;
  setFundingData: (data: FundingFormData) => void;
}

const NotebookPublishContext = createContext<NotebookPublishContextType | undefined>(undefined);

export function NotebookPublishProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [title, setTitle] = useState('');
  const [articleType, setArticleType] = useState<ArticleType>('research');
  const [fundingData, setFundingData] = useState<FundingFormData>({
    budget: '',
    rewardFunders: false,
    nftArt: null,
    nftSupply: '1000',
  });

  return (
    <NotebookPublishContext.Provider
      value={{
        editor,
        setEditor,
        title,
        setTitle,
        articleType,
        setArticleType,
        fundingData,
        setFundingData,
      }}
    >
      {children}
    </NotebookPublishContext.Provider>
  );
}

export function useNotebookPublish() {
  const context = useContext(NotebookPublishContext);
  if (context === undefined) {
    throw new Error('useNotebookPublish must be used within a NotebookPublishProvider');
  }
  return context;
}
