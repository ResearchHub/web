import { SearchSuggestion } from '@/types/search';

export const SEARCH_HISTORY_KEY = 'search_history';
export const MAX_HISTORY_ITEMS = 10;

export const getSearchHistory = (): SearchSuggestion[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const saveSearchHistory = (items: SearchSuggestion[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('search-history-updated'));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const clearSearchHistory = () => {
  saveSearchHistory([]);
};
