import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div
        className="grid min-h-screen w-full"
        style={{
          gridTemplateColumns: '70px minmax(0, 1fr)',
        }}
      >
        {/* Main Left Sidebar - 70px fixed width (minimized) */}
        <div className="border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
          <MainLeftSidebar forceMinimize={true} />
        </div>
        {children}
      </div>
    </div>
  );
}
