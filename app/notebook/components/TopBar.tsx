'use client';

import { Button } from '@/components/ui/Button';
import { Menu, FileUp, ExternalLink } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useOrganizationDataContext } from '@/contexts/OrganizationDataContext';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export function TopBar() {
  const { toggleLeftSidebar, toggleRightSidebar } = useSidebar();
  const { currentNote: note, isLoading } = useOrganizationDataContext();

  const isPublished = Boolean(note?.post?.id);

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
        <div className="flex-1 text-center">
          {isLoading ? (
            <div className="inline-flex items-center h-5 w-16 bg-gray-100 animate-pulse rounded-full" />
          ) : note ? (
            isPublished ? (
              <Badge variant="success" size="sm">
                <span className="mr-1 text-sm">Published</span>
                {note.post?.contentType === 'preregistration' && note.post?.slug && (
                  <Link
                    href={`/fund/${note.post.id}/${note.post.slug}`}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                Draft
              </Badge>
            )
          ) : null}
        </div>

        {/* Right sidebar toggle button */}
        {note && (
          <Button
            onClick={toggleRightSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle right sidebar"
            variant="ghost"
            size="sm"
          >
            <div className="flex items-center gap-1">
              <FileUp className="h-4 w-4" />
              <span>{isPublished ? 'Re-publish' : 'Publish'}</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
