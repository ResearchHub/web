'use client';

import { useState } from 'react';
import LeftSidebar from '@/components/Editor/components/Sidebar/LeftSidebar';
import { TopBar } from '@/app/layouts/TopBar';
import { PublishModal } from '@/components/modals/PublishModal';
import { PublishingSidebar } from '@/components/Editor/components/Sidebar/PublishingSidebar';
import './globals.css';
import 'cal-sans';
import { OrganizationNotesProvider } from '@/contexts/OrganizationNotesContext';

import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

type ArticleType = 'research';

export default function NotebookLayout({ children }: { children: React.ReactNode }) {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [articleType, setArticleType] = useState<ArticleType>('research');

  return (
    <OrganizationNotesProvider>
      <div className="flex min-h-screen">
        <div className="hidden xl:block">
          <LeftSidebar />
        </div>
        <div className="flex flex-1">
          <div className="flex-1">
            <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="min-h-[calc(100vh-64px)]">{children}</main>
          </div>
          <PublishingSidebar
            articleType={articleType}
            setArticleType={(type) => setArticleType(type as ArticleType)}
            bountyAmount={null}
            onBountyClick={() => {}}
            onPublishClick={() => setIsPublishModalOpen(true)}
            title=""
            onTitleChange={() => {}}
          />
        </div>

        <PublishModal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} />
      </div>
    </OrganizationNotesProvider>
  );
}
