'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import type { NonprofitOrg } from '@/types/nonprofit';
import { AssistantService } from '@/services/assistant.service';

interface Props {
  onSubmit: (field: string, value: any, displayText: string) => void;
}

export const AssistantInlineNonprofitLookup: React.FC<Props> = ({ onSubmit }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NonprofitOrg[]>([]);
  const [selected, setSelected] = useState<NonprofitOrg | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const data = await AssistantService.searchNonprofits(q);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const handleConfirm = () => {
    if (!selected) return;
    onSubmit('nonprofit_id', selected.id, `I selected ${selected.name} as the non-profit entity`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-3">
      <p className="text-xs font-medium text-gray-500">Search for a non-profit entity</p>

      {selected ? (
        <div className="flex items-center justify-between p-2 rounded-lg bg-primary-50">
          <div className="flex items-center gap-2 min-w-0">
            {selected.logoUrl && (
              <img
                src={selected.logoUrl}
                alt=""
                className="w-6 h-6 rounded object-contain flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <span className="text-sm font-medium text-primary-700 truncate block">
                {selected.name}
              </span>
              {selected.ein && (
                <span className="text-[10px] text-primary-400">EIN: {selected.ein}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="text-primary-400 hover:text-primary-600 flex-shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search non-profits..."
              className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
            {isSearching && (
              <Loader2
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
              />
            )}
          </div>

          {results.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {results.map((np) => (
                <button
                  key={np.id}
                  onClick={() => setSelected(np)}
                  className="flex items-center w-full px-3 py-2 text-sm
                    hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {np.logoUrl ? (
                      <img
                        src={np.logoUrl}
                        alt=""
                        className="w-5 h-5 rounded object-contain flex-shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{np.name}</p>
                      {np.ein && <p className="text-[10px] text-gray-400">EIN: {np.ein}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.trim() && !isSearching && results.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No non-profits found</p>
          )}
        </>
      )}

      {selected && (
        <button
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg
            bg-primary-600 text-white text-sm font-medium
            hover:bg-primary-700 active:scale-[0.98] transition-all"
        >
          <Check size={14} />
          Confirm selection
        </button>
      )}
    </div>
  );
};
