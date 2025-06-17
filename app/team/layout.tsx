import { LeftSidebar as MainLeftSidebar } from '../layouts/LeftSidebar';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Main Content Area */}
        <main className="relative">{children}</main>
      </div>
    </div>
  );
}
