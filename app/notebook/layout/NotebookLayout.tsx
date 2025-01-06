import { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import { TopBar } from '../../layouts/TopBar';
import { PublishModal } from '@/components/modals/PublishModal';
import { BountyModal } from '@/components/modals/BountyModal';
import { PublishingSidebar } from './PublishingSidebar';

type ArticleType = 'research' | 'grant';

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isBountyModalOpen, setIsBountyModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bountyAmount, setBountyAmount] = useState<number | null>(null);
  const [articleType, setArticleType] = useState<ArticleType>('research');

  return (
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
          setArticleType={setArticleType}
          bountyAmount={bountyAmount}
          onBountyClick={() => setIsBountyModalOpen(true)}
          onPublishClick={() => setIsPublishModalOpen(true)}
          title=""
          onTitleChange={() => {}}
        />
      </div>

      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
      <BountyModal
        isOpen={isBountyModalOpen}
        onClose={() => setIsBountyModalOpen(false)}
        onAddBounty={(amount) => setBountyAmount(amount)}
      />
    </div>
  );
}
