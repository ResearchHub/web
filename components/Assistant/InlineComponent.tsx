'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Check, Plus, Loader2 } from 'lucide-react';
import type {
  InputType,
  AuthorSearchResult,
  HubSearchResult,
  NonprofitSearchResult,
} from '@/types/assistant';
import { AssistantService } from '@/services/assistant.service';

interface InlineComponentProps {
  inputType: InputType;
  onSubmit: (field: string, value: any, displayText: string) => void;
}

// ── Debounce hook ───────────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}

// ── Author Lookup ───────────────────────────────────────────────────────────

function AuthorLookup({ onSubmit }: { onSubmit: InlineComponentProps['onSubmit'] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AuthorSearchResult[]>([]);
  const [selected, setSelected] = useState<AuthorSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const search = async () => {
      setIsSearching(true);
      try {
        const data = await AssistantService.searchAuthors(debouncedQuery);
        if (!cancelled) {
          // Filter out already-selected authors
          const selectedIds = new Set(selected.map((a) => a.id));
          setResults(data.filter((a) => !selectedIds.has(a.id)));
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };

    search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, selected]);

  const addAuthor = (author: AuthorSearchResult) => {
    setSelected((prev) => [...prev, author]);
    setQuery('');
    setResults([]);
  };

  const removeAuthor = (id: number) => {
    setSelected((prev) => prev.filter((a) => a.id !== id));
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    const ids = selected.map((a) => a.id);
    const names = selected.map((a) => a.name).join(', ');
    onSubmit('author_ids', ids, `I selected ${names} as co-authors`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-3">
      <p className="text-xs font-medium text-gray-500">Search for authors</p>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((author) => (
            <span
              key={author.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
            >
              {author.profileImage && (
                <img
                  src={author.profileImage}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              {author.name}
              <button
                onClick={() => removeAuthor(author.id)}
                className="hover:text-primary-900 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a name..."
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

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
          {results.map((author) => (
            <button
              key={author.id}
              onClick={() => addAuthor(author)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm
                hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                {author.profileImage ? (
                  <img
                    src={author.profileImage}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{author.name}</p>
                  {author.headline && (
                    <p className="text-xs text-gray-400 truncate">{author.headline}</p>
                  )}
                </div>
              </div>
              <Plus size={14} className="text-gray-400 flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {query.trim() && !isSearching && results.length === 0 && debouncedQuery === query && (
        <p className="text-xs text-gray-400 text-center py-2">No authors found</p>
      )}

      {/* Confirm button */}
      {selected.length > 0 && (
        <button
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg
            bg-primary-600 text-white text-sm font-medium
            hover:bg-primary-700 active:scale-[0.98] transition-all"
        >
          <Check size={14} />
          Confirm {selected.length} author{selected.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}

// ── Topic Selector ──────────────────────────────────────────────────────────

function TopicSelector({ onSubmit }: { onSubmit: InlineComponentProps['onSubmit'] }) {
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState<HubSearchResult[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Map<number, HubSearchResult>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const debouncedQuery = useDebouncedValue(query, 300);

  // Load initial popular topics
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const load = async () => {
      try {
        const data = await AssistantService.searchHubs();
        setTopics(data.slice(0, 20)); // Show top 20
      } catch {
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) return;

    let cancelled = false;
    const search = async () => {
      setIsLoading(true);
      try {
        const data = await AssistantService.searchHubs(debouncedQuery);
        if (!cancelled) setTopics(data.slice(0, 20));
      } catch {
        if (!cancelled) setTopics([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const toggle = (topic: HubSearchResult) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(topic.id)) {
        next.delete(topic.id);
      } else {
        next.add(topic.id);
      }
      return next;
    });
    setSelectedTopics((prev) => {
      const next = new Map(prev);
      if (next.has(topic.id)) {
        next.delete(topic.id);
      } else {
        next.set(topic.id, topic);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    const names = Array.from(selectedTopics.values())
      .map((t) => t.name)
      .join(', ');
    onSubmit('topic_ids', ids, `I selected ${names} as topics`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-3">
      <p className="text-xs font-medium text-gray-500">Select relevant topics</p>

      {/* Search input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        />
      </div>

      {/* Topic chips */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={18} className="text-gray-400 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {topics.map((topic) => {
            const isSelected = selected.has(topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => toggle(topic)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-150
                  ${
                    isSelected
                      ? 'bg-primary-600 text-white border border-primary-600'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
              >
                {isSelected && <Check size={12} className="mr-1" />}
                {topic.name}
              </button>
            );
          })}
        </div>
      )}

      {selected.size > 0 && (
        <button
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg
            bg-primary-600 text-white text-sm font-medium
            hover:bg-primary-700 active:scale-[0.98] transition-all"
        >
          <Check size={14} />
          Confirm {selected.size} topic{selected.size !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}

// ── Non-profit Lookup ───────────────────────────────────────────────────────

function NonprofitLookup({ onSubmit }: { onSubmit: InlineComponentProps['onSubmit'] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NonprofitSearchResult[]>([]);
  const [selected, setSelected] = useState<NonprofitSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const search = async () => {
      setIsSearching(true);
      try {
        const data = await AssistantService.searchNonprofits(debouncedQuery);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };
    search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

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

          {query.trim() && !isSearching && results.length === 0 && debouncedQuery === query && (
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
}

// ── Final Review ────────────────────────────────────────────────────────────

function FinalReview({ onSubmit }: { onSubmit: InlineComponentProps['onSubmit'] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit('submit', true, 'Submitted proposal');
  };

  return (
    <div className="bg-white border border-green-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-green-700">
        <Check size={18} strokeWidth={2.5} />
        <p className="text-sm font-semibold">All required fields collected!</p>
      </div>
      <p className="text-sm text-gray-600">
        Your submission is ready. Review the details above and submit when you&apos;re satisfied.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
            bg-green-600 text-white text-sm font-medium
            hover:bg-green-700 active:scale-[0.98] transition-all
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
        <button
          onClick={() => onSubmit('edit', false, 'Requested edits')}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
            border border-gray-300 text-gray-700 text-sm font-medium
            hover:bg-gray-50 active:scale-[0.98] transition-all
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// ── Main Inline Component ───────────────────────────────────────────────────

export const InlineComponent: React.FC<InlineComponentProps> = ({ inputType, onSubmit }) => {
  if (!inputType) return null;

  switch (inputType) {
    case 'author_lookup':
      return <AuthorLookup onSubmit={onSubmit} />;
    case 'topic_select':
      return <TopicSelector onSubmit={onSubmit} />;
    case 'nonprofit_lookup':
      return <NonprofitLookup onSubmit={onSubmit} />;
    case 'final_review':
      return <FinalReview onSubmit={onSubmit} />;
    case 'rich_editor':
      // Handled at the ChatScreen level via the EditorPanel split layout
      return null;
    default:
      return null;
  }
};
