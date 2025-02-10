import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/styles';
import { UserMention } from '@/types/comment';
import { Editor } from '@tiptap/core';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './mention.css';

interface SuggestionPortalProps {
  items: UserMention[];
  command: (item: UserMention) => void;
  clientRect: () => DOMRect;
  editor: Editor;
  className?: string;
}

export const SuggestionPortal = ({
  items,
  command,
  clientRect,
  className,
}: SuggestionPortalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tippyInstance = useRef<any>(null);
  const portalRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  // Use layout effect to ensure DOM measurements are accurate
  useLayoutEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Cleanup function to safely remove portal and tippy instance
  const cleanup = () => {
    if (tippyInstance.current) {
      tippyInstance.current[0].destroy();
      tippyInstance.current = null;
    }
    if (portalRef.current && document.body.contains(portalRef.current)) {
      document.body.removeChild(portalRef.current);
      portalRef.current = null;
    }
  };

  useEffect(() => {
    if (!mounted || !containerRef.current || !clientRect) {
      return cleanup;
    }

    // Create Tippy instance
    if (!tippyInstance.current) {
      tippyInstance.current = tippy('body', {
        getReferenceClientRect: clientRect,
        appendTo: document.body,
        content: containerRef.current,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        arrow: true,
        theme: 'mention',
        maxWidth: '400px',
        offset: [0, 8],
        animation: 'scale-subtle',
        duration: 150,
      });
    } else {
      // Update position
      tippyInstance.current[0].setProps({
        getReferenceClientRect: clientRect,
      });
    }

    return cleanup;
  }, [clientRect, mounted]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  if (!items.length || !mounted) {
    cleanup();
    return null;
  }

  const portal = createPortal(
    <>
      <div
        ref={containerRef}
        className={cn(
          'bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-[300px] overflow-y-auto min-w-[200px]',
          'divide-y divide-gray-100',
          className
        )}
      >
        {items.map((item, index) => (
          <button
            key={item.authorProfileId || index}
            className={cn(
              'w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150',
              'group focus:outline-none focus:bg-gray-50'
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              cleanup();
              command(item);
            }}
          >
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium group-hover:bg-indigo-200 transition-colors duration-150">
              {item.firstName?.[0]}
              {item.lastName?.[0]}
            </div>
            <div className="flex-grow min-w-0">
              <div className="font-medium text-gray-900">
                {item.firstName} {item.lastName}
              </div>
              {item.authorProfileId && (
                <div className="text-sm text-gray-500 truncate">@{item.authorProfileId}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </>,
    document.body
  );

  // Store the portal element reference
  if (portal) {
    const element = document.querySelector('[data-tippy-root]') as HTMLElement;
    if (element && element !== portalRef.current) {
      portalRef.current = element;
    }
  }

  return portal;
};
