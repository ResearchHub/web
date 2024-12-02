import LeftSidebar from './LeftSidebar';
import { TopBar } from '../../layouts/TopBar';

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1">
        <TopBar />
        <main>{children}</main>
      </div>
    </div>
  );
}
