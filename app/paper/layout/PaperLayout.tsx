import { PageLayout } from '@/app/components/layout/PageLayout';
import { PaperRightSidebar } from '@/app/components/paper/PaperRightSidebar';

interface PaperLayoutProps {
  children: React.ReactNode;
  paper: any; // You might want to define a proper type for this
}

export default function PaperLayout({
  children,
  paper,
}: PaperLayoutProps) {
  return (
    <PageLayout
      rightSidebar={<PaperRightSidebar paper={paper} />}
    >
      {children}
    </PageLayout>
  );
} 