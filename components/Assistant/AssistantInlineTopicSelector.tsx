'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Check, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import type { Topic } from '@/types/topic';
import { AssistantService } from '@/services/assistant.service';

interface Props {
  onSubmit: (field: string, value: any, displayText: string) => void;
}

export const AssistantInlineTopicSelector: React.FC<Props> = ({ onSubmit }) => {
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Map<number, Topic>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  // Load initial topics
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const load = async () => {
      try {
        const data = await AssistantService.searchHubs();
        setTopics(data.slice(0, 20));
      } catch {
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) return;
      setIsLoading(true);
      try {
        const data = await AssistantService.searchHubs(q);
        setTopics(data.slice(0, 20));
      } catch {
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    }
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const toggle = (topic: Topic) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(topic.id)) next.delete(topic.id);
      else next.set(topic.id, topic);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected.keys());
    const names = Array.from(selected.values())
      .map((t) => t.name)
      .join(', ');
    onSubmit('topic_ids', ids, `I selected ${names} as topics`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-3">
      <p className="text-xs font-medium text-gray-500">Select relevant topics</p>

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
};
