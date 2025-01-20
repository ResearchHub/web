import { SearchSuggestion } from '@/types/search';

export const SEARCH_HISTORY_KEY = 'search_history';
export const MAX_HISTORY_ITEMS = 10;

// Helper functions to handle localStorage
export const getSearchHistory = (): SearchSuggestion[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    const history = stored ? JSON.parse(stored) : [];
    return history;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const saveSearchHistory = (items: SearchSuggestion[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('search-history-updated'));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};
