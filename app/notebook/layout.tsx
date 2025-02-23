'use client';

import { useState } from 'react';
import LeftSidebar from '@/components/Editor/components/Sidebar/LeftSidebar';
import { TopBar } from '@/app/layouts/TopBar';
import { PublishingForm } from '@/components/Editor/components/Sidebar/PublishingForm';
import './globals.css';
import 'cal-sans';
import { OrganizationNotesProvider } from '@/contexts/OrganizationNotesContext';
import { NotebookPublishProvider } from '@/contexts/NotebookPublishContext';

import '@fontsource/inter/100.css';
import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

export default function NotebookLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <OrganizationNotesProvider>
      <NotebookPublishProvider>
        {/* Main layout grid with percentage-based columns */}
        <div
          className="grid min-h-screen w-full"
          style={{
            gridTemplateColumns: 'minmax(0, 16%) minmax(0, 64%) minmax(0, 20%)',
          }}
        >
          {/* Left Sidebar - 16% */}
          <div className="hidden xl:block w-full">
            <LeftSidebar />
          </div>

          {/* Main content area - 64% */}
          <div className="flex flex-col w-full px-4">
            {/* TopBar constrained to content width */}
            <div className="h-16 border-b border-gray-200">
              <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            {/* Main content with proper height calculation */}
            <div className="flex-1 overflow-hidden">{children}</div>
          </div>

          {/* Right Sidebar - 20% */}
          <div className="border-l border-gray-200 w-full">
            <PublishingForm bountyAmount={null} onBountyClick={() => {}} />
          </div>
        </div>
      </NotebookPublishProvider>
    </OrganizationNotesProvider>
  );
}
