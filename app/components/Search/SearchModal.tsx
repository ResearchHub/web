'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Search } from '@/components/Search/Search';

interface SearchModalProps {
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-[15vh] sm:pt-[20vh]"
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden transform transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center p-3 border-b border-gray-200 flex-shrink-0">
          <Search
            placeholder="Search or ask a question in ResearchHub..."
            className="flex-grow mr-2"
            onSelect={() => {
              onClose();
            }}
            displayMode="inline"
            showSuggestionsOnFocus={true}
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            aria-label="Close search"
          >
            <X size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
