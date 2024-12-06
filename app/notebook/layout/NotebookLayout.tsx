import { LeftSidebar } from '@/app/layouts/LeftSidebar';
import { TopBar } from '../../layouts/TopBar';


export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar isPublishMenuOpen={false} onPublishMenuChange={function (isOpen: boolean): void {
        throw new Error('Function not implemented.');
      } } />
      <div className="flex-1">
        <TopBar onMenuClick={() => {}} />
        <main>{children}</main>
      </div>
    </div>
  );
}
