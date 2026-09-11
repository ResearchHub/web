'use client';

import { useLayoutEffect, useState } from 'react';
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

export function TopBarSearchButton({ onClick }: TopBarSearchButtonProps) {
  const shortcutLabel = useSearchShortcutLabel();

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="flex items-center w-full md:!w-60 max-w-md mx-auto h-9 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-left group"
      >
        <SearchIcon className="h-4 w-4 text-gray-600 mr-3 flex-shrink-0" />
        <span className="text-sm flex-1 truncate text-gray-500">Search</span>
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
