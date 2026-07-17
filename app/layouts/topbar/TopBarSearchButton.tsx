'use client';

import { Suspense, useLayoutEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

function getSearchShortcutLabel(): string {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘K' : 'Ctrl+K';
}

function useSearchShortcutLabel(): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useLayoutEffect(() => {
    setLabel(getSearchShortcutLabel());
  }, []);

  return label;
}

interface TopBarSearchButtonProps {
  onClick: () => void;
}

function TopBarSearchButtonInner({
  onClick,
  currentSearchQuery,
}: TopBarSearchButtonProps & { currentSearchQuery: string | null }) {
  const shortcutLabel = useSearchShortcutLabel();
  const displayText = currentSearchQuery || 'Search';

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="flex items-center w-full md:!w-60 max-w-md mx-auto h-9 px-4 py-1.5 bg-gray-100/75 hover:bg-gray-200 rounded-full transition-colors text-left group"
      >
        <SearchIcon className="h-4 w-4 text-gray-600 mr-3 flex-shrink-0" />
        <span
          className={`text-sm flex-1 truncate ${currentSearchQuery ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <span className="tablet:!hidden">{displayText}</span>
          <span className="hidden tablet:!inline">{displayText}</span>
        </span>
        {shortcutLabel && (
          <div className="hidden md:!flex items-center space-x-1 ml-2 flex-shrink-0">
            <span className="text-[12px] -mr-1 text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
              {shortcutLabel}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}

function TopBarSearchButtonWithQuery(props: TopBarSearchButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearchQuery = pathname === '/search' ? searchParams.get('q') : null;

  return <TopBarSearchButtonInner {...props} currentSearchQuery={currentSearchQuery} />;
}

export const TopBarSearchButton = (props: TopBarSearchButtonProps) => (
  <Suspense fallback={<TopBarSearchButtonInner {...props} currentSearchQuery={null} />}>
    <TopBarSearchButtonWithQuery {...props} />
  </Suspense>
);
