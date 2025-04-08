'use client';

import { Button } from '@/components/ui/Button';
import { Menu, FileUp, ExternalLink } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { PublishedStatusSection } from './PublishingForm/components/PublishedStatusSection';
import { isFeatureEnabled } from '@/utils/featureFlags';

export function TopBarMobile() {
  const { toggleLeftSidebar, toggleRightSidebar } = useSidebar();
  const { currentNote: note, isLoading } = useNotebookContext();

  const isPublished = Boolean(note?.post?.id);
  const isLegacyNote = !note?.contentJson && isFeatureEnabled('legacyNoteBanner');

  return (
    <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-20">
      <div className="h-full flex items-center px-4 justify-between">
        {/* Left sidebar toggle button */}
        <Button
          onClick={toggleLeftSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle left sidebar"
          variant="ghost"
          size="icon"
        >
          <div className="flex">
            <Menu className="h-5 w-5" />
          </div>
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
