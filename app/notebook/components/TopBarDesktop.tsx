'use client';

import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { PublishedStatusSection } from './PublishingForm/components/PublishedStatusSection';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';

interface TopBarDesktopProps {
  /** When provided (modal context), shows a close button on the left. */
  onClose?: () => void;
}

export function TopBarDesktop({ onClose }: TopBarDesktopProps) {
  const { toggleLeftSidebar, toggleRightSidebar, isRightSidebarOpen } = useSidebar();
  const { currentNote: note, isLoading } = useNotebookContext();

  const isPublished = Boolean(note?.post?.id);
  const isLegacyNote = !note?.contentJson && isFeatureEnabled(FeatureFlag.LegacyNoteBanner);
  const shouldShowRightSidebar = Boolean(note);

  return (
    <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-20">
      <div className="h-full flex items-center px-4 justify-between">
        {/* Left: close button when in modal context */}
        {onClose ? (
          <Button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close"
            variant="ghost"
            size="icon"
          >
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <div />
        )}

        {/* Center content - page title or logo */}
        <PublishedStatusSection />

        {/* Right sidebar toggle button */}
        {shouldShowRightSidebar && !isLegacyNote ? (
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
