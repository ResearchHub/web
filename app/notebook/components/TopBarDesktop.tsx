'use client';

import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { PublishedStatusSection } from './PublishingForm/components/PublishedStatusSection';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';
import { useState, useEffect } from 'react';

export function TopBarDesktop() {
  const { toggleLeftSidebar, toggleRightSidebar, isRightSidebarOpen } = useSidebar();
  const { currentNote: note, isLoading } = useNotebookContext();
  const [shortcutText, setShortcutText] = useState('Ctrl+K');

  const isPublished = Boolean(note?.post?.id);
  const isLegacyNote = !note?.contentJson && isFeatureEnabled(FeatureFlag.LegacyNoteBanner);
  const shouldShowRightSidebar = Boolean(note);

  // Detect OS for keyboard shortcut display
  useEffect(() => {
    const isMac = typeof window !== 'undefined' && /Mac/.test(navigator.platform);
    setShortcutText(isMac ? '⌘K' : 'Ctrl+K');
  }, []);

  return (
    <div className="h-16 border-b border-gray-200 sticky top-0 bg-white z-20">
      <div className="h-full flex items-center px-4 justify-between">
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
              title={`Close sidebar (${shortcutText})`}
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
              title={`Open sidebar (${shortcutText})`}
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  <ChevronLeft className="h-5 w-5" />
                  <ChevronLeft className="h-5 w-5 -ml-3" />
                </div>
                <span>{isPublished ? 'PUBLISH' : 'Open sidebar'}</span>
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded font-medium">
                  {shortcutText}
                </span>
              </div>
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}
