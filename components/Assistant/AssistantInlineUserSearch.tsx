'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Check, Plus, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import type { UserSuggestion } from '@/types/search';
import { AssistantService } from '@/services/assistant.service';

interface AssistantInlineUserSearchProps {
  /** Label shown above the search input */
  label: string;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Field key sent in onSubmit (e.g., 'author_ids', 'grant_contacts') */
  fieldKey: string;
  /** Noun used in confirm button and display text (e.g., 'author', 'contact') */
  noun: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Callback when user confirms selection */
  onSubmit: (field: string, value: any, displayText: string) => void;
}

export const AssistantInlineUserSearch: React.FC<AssistantInlineUserSearchProps> = ({
  label,
  placeholder = 'Type a name...',
  fieldKey,
  noun,
  emptyMessage = 'No users found',
  onSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSuggestion[]>([]);
  const [selected, setSelected] = useState<UserSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const data = await AssistantService.searchAuthors(q);
        const selectedIds = new Set(selectedRef.current.map((a) => a.authorProfile?.id));
        setResults(data.filter((a) => !selectedIds.has(a.authorProfile?.id)));
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

  const addUser = (user: UserSuggestion) => {
    setSelected((prev) => [...prev, user]);
    setQuery('');
    setResults([]);
  };

  const removeUser = (authorProfileId: number) => {
    setSelected((prev) => prev.filter((a) => a.authorProfile?.id !== authorProfileId));
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    const ids = selected.map((a) => a.authorProfile?.id);
    const names = selected.map((a) => a.displayName).join(', ');
    const plural = selected.length !== 1 ? 's' : '';
    onSubmit(fieldKey, ids, `I selected ${names} as ${noun}${plural}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((user) => (
            <span
              key={user.authorProfile?.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
            >
              {user.authorProfile?.profileImage && (
                <img
                  src={user.authorProfile.profileImage}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              {user.displayName}
              <button
                onClick={() => removeUser(user.authorProfile?.id)}
                className="hover:text-primary-900 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
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
          {results.map((user) => (
            <button
              key={user.authorProfile?.id}
              onClick={() => addUser(user)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm
                hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                {user.authorProfile?.profileImage ? (
                  <img
                    src={user.authorProfile.profileImage}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{user.displayName}</p>
                  {user.authorProfile?.headline && (
                    <p className="text-xs text-gray-400 truncate">{user.authorProfile.headline}</p>
                  )}
                </div>
              </div>
              <Plus size={14} className="text-gray-400 flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {query.trim() && !isSearching && results.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">{emptyMessage}</p>
      )}

      {selected.length > 0 && (
        <button
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg
            bg-primary-600 text-white text-sm font-medium
            hover:bg-primary-700 active:scale-[0.98] transition-all"
        >
          <Check size={14} />
          Confirm {selected.length} {noun}
          {selected.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};
