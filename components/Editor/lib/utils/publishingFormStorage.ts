import { PublishingFormData } from '../../../../app/notebook/components/PublishingForm/schema';

const STORAGE_KEY = 'publishing_forms';
const MAX_STORED_NOTES = 20;

// Fields that should be excluded from storage
const EXCLUDED_FIELDS = ['coverImage'] as const;

type StoredNote = {
  noteId: string;
  data: Partial<PublishingFormData>;
  timestamp: number;
};

const getStoredNotes = (): StoredNote[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading publishing forms from localStorage:', error);
    return [];
  }
};

// Helper function to remove excluded fields from data
const removeExcludedFields = (data: Partial<PublishingFormData>): Partial<PublishingFormData> => {
  const filteredData = { ...data };
  EXCLUDED_FIELDS.forEach((field) => {
    delete filteredData[field];
  });
  return filteredData;
};

export const savePublishingFormToStorage = (noteId: string, data: Partial<PublishingFormData>) => {
  if (typeof window === 'undefined') return;
  try {
    const storedNotes = getStoredNotes();
    const currentIndex = storedNotes.findIndex((note) => note.noteId === noteId);
    // Remove excluded fields before storing
    const filteredData = removeExcludedFields(data);
    const newNote: StoredNote = { noteId, data: filteredData, timestamp: Date.now() };

    if (currentIndex !== -1) {
      // Update existing note
      storedNotes[currentIndex] = newNote;
    } else {
      // Add new note, remove oldest if at limit
      if (storedNotes.length >= MAX_STORED_NOTES) {
        storedNotes.shift(); // Remove oldest note
      }
      storedNotes.push(newNote);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedNotes));
  } catch (error) {
    console.error('Error saving publishing form to localStorage:', error);
  }
};

export const loadPublishingFormFromStorage = (
  noteId: string
): Partial<PublishingFormData> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const storedNotes = getStoredNotes();
    const note = storedNotes.find((note) => note.noteId === noteId);

    if (!note) return null;

    return note.data;
  } catch (error) {
    console.error('Error reading publishing form from localStorage:', error);
    return null;
  }
};

export const clearPublishingFormStorage = (noteId: string) => {
  if (typeof window === 'undefined') return;
  try {
    const storedNotes = getStoredNotes();
    const filteredNotes = storedNotes.filter((note) => note.noteId !== noteId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
  } catch (error) {
    console.error('Error clearing publishing form from localStorage:', error);
  }
};
