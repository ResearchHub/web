'use client';

import { Button } from '@/components/ui/Button';
import { Menu, FileUp, X } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { PublishedStatusSection } from './PublishingForm/components/PublishedStatusSection';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';

interface TopBarMobileProps {
  /** When provided (modal context), shows a close button instead of the hamburger. */
  onClose?: () => void;
}

export function TopBarMobile({ onClose }: TopBarMobileProps) {
  const { toggleLeftSidebar, toggleRightSidebar } = useSidebar();
  const { currentNote: note } = useNotebookContext();

  const isPublished = Boolean(note?.post?.id);
  const isLegacyNote = !note?.contentJson && isFeatureEnabled(FeatureFlag.LegacyNoteBanner);

  return (
    <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-20">
      <div className="h-full flex items-center px-4 justify-between">
        {/* Left: close button (modal) or hamburger menu (full page) */}
        <Button
          onClick={onClose ?? toggleLeftSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label={onClose ? 'Close' : 'Toggle left sidebar'}
          variant="ghost"
          size="icon"
        >
          {onClose ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Center content - page title or logo */}
        <PublishedStatusSection />

        {/* Right sidebar toggle button */}
        {note && !isLegacyNote && (
          <Button
            onClick={toggleRightSidebar}
            className="p-2 rounded-md"
            aria-label="Toggle right sidebar"
            variant="default"
            size="sm"
          >
            <div className="flex items-center gap-1">
              <FileUp className="h-4 w-4" />
              <span>{isPublished ? 'PUBLISH' : 'Publish'}</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
