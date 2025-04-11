'use client';

import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { PublishedStatusSection } from './PublishingForm/components/PublishedStatusSection';

export function TopBarDesktop() {
  const { toggleLeftSidebar, toggleRightSidebar, isRightSidebarOpen } = useSidebar();
  const { currentNote: note, isLoading } = useNotebookContext();

  const isPublished = Boolean(note?.post?.id);
  const shouldShowRightSidebar = Boolean(note);

  return (
    <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-20">
      <div className="h-full flex items-center px-4 justify-between">
        {/* Center content - page title or logo */}
        <PublishedStatusSection />

        {/* Right sidebar toggle button */}
        {shouldShowRightSidebar ? (
          isRightSidebarOpen ? (
            <Button
              onClick={toggleRightSidebar}
              className="p-2 rounded-md hover:bg-gray-100"
              variant="ghost"
              size="icon"
            >
              <div className="flex">
                <ChevronRight className="h-5 w-5" />
                <ChevronRight className="h-5 w-5 -ml-3" />
              </div>
            </Button>
          ) : (
            <Button
              onClick={toggleRightSidebar}
              className="p-2 rounded-md"
              aria-label="Toggle right sidebar"
              variant="default"
              size="sm"
            >
              <div className="flex items-center gap-1">
                <div className="flex">
                  <ChevronLeft className="h-5 w-5" />
                  <ChevronLeft className="h-5 w-5 -ml-3" />
                </div>
                <span>{isPublished ? 'PUBLISH' : 'Publish'}</span>
              </div>
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}
