'use client'

import { useEffect } from 'react'
import { Work } from '@/types/document'
import { SearchSuggestion } from '@/services/types/search.dto'
import { getSearchHistory, saveSearchHistory, MAX_HISTORY_ITEMS } from '@/utils/searchHistory'

interface SearchHistoryTrackerProps {
  work: Work
}

export function SearchHistoryTracker({ work }: SearchHistoryTrackerProps) {
  useEffect(() => {
    // Get existing history
    const history = getSearchHistory()

    // Create new suggestion from work
    const newSuggestion: SearchSuggestion = {
      id: work.id,
      entityType: 'work',
      displayName: work.title,
      authors: work.authors.map(a => a.authorProfile.fullName),
      doi: work.doi || '',
      score: 0,
      citations: 0,
      source: 'researchhub',
      openalexId: '',
      isRecent: true,
      slug: work.slug
    }

    // Update or add the current suggestion
    const existingIndex = history.findIndex(item => item.id === work.id)
    
    if (existingIndex !== -1) {
      // Remove from current position
      history.splice(existingIndex, 1)
    }

    // Add to the start of history
    history.unshift(newSuggestion)

    // Keep only the most recent suggestions
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop()
    }

    // Save updated history
    saveSearchHistory(history)
  }, [work])

  return null // This component doesn't render anything
} 