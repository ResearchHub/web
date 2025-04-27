const STORAGE_KEY = 'comment_drafts';
const MAX_STORED_DRAFTS = 20;

type CommentDraft = {
  updateAt: number;
  data: any;
};

type CommentDraftsStorage = {
  [key: string]: CommentDraft;
};

const getStoredDrafts = (): CommentDraftsStorage => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading comment drafts from localStorage:', error);
    return {};
  }
};

export const setCommentDraft = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    const storedDrafts = getStoredDrafts();
    const newDraft: CommentDraft = {
      updateAt: Date.now(),
      data,
    };

    // If we're at the limit and this is a new draft, remove the oldest one
    const currentDrafts = Object.entries(storedDrafts);
    if (currentDrafts.length >= MAX_STORED_DRAFTS && !storedDrafts[key]) {
      // Sort by updateAt and remove the oldest
      const oldestDraft = currentDrafts.sort(([, a], [, b]) => a.updateAt - b.updateAt)[0];
      if (oldestDraft) {
        delete storedDrafts[oldestDraft[0]];
      }
    }

    storedDrafts[key] = newDraft;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedDrafts));
  } catch (error) {
    console.error('Error saving comment draft to localStorage:', error);
  }
};

export const getCommentDraftById = (key: string): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const storedDrafts = getStoredDrafts();
    return storedDrafts[key]?.data ?? null;
  } catch (error) {
    console.error('Error reading comment draft from localStorage:', error);
    return null;
  }
};

export const removeCommentDraftById = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    const storedDrafts = getStoredDrafts();
    delete storedDrafts[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedDrafts));
  } catch (error) {
    console.error('Error removing comment draft from localStorage:', error);
  }
};

export const clearAllCommentDrafts = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  } catch (error) {
    console.error('Error clearing all comment drafts from localStorage:', error);
  }
};
