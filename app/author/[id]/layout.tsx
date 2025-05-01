import { PageLayout } from '@/app/layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';

export default function AuthorProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout rightSidebar={null}>
      <div className="w-full">{children}</div>
    </PageLayout>
  );
}
