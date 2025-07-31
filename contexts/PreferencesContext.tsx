'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

interface UserPreferences {
  firstName: string;
  selectedCategories: string[];
  selectedSubcategories: string[];
  completedAt?: string;
  useMlScoring?: boolean;
  currentOnboardingStep?: string;
}

interface PreferencesContextType {
  preferences: UserPreferences | null;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  clearPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEY = 'researchhub_user_preferences';

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (preferences) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
    }
  }, [preferences]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({
      firstName: prev?.firstName || '',
      selectedCategories: prev?.selectedCategories || [],
      selectedSubcategories: prev?.selectedSubcategories || [],
      ...prev,
      ...updates,
    }));
  }, []);

  const clearPreferences = useCallback(() => {
    setPreferences(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing user preferences:', error);
    }
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        clearPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
