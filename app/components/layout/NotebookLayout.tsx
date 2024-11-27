import { LeftSidebar } from '../components/layout/LeftSidebar';
import { TopBar } from '../components/layout/TopBar';

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
