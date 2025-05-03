import { PageLayout } from '@/app/layouts/PageLayout';

export default function AuthorProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout rightSidebar={null}>
      <div className="w-full">{children}</div>
    </PageLayout>
  );
}
