import { useState, useEffect, useMemo } from 'react'
import { SearchService } from '@/services/search.service'
import { SearchSuggestion } from '@/types/search'
import { getSearchHistory, saveSearchHistory, SEARCH_HISTORY_KEY } from '@/utils/searchHistory'

export function useSearchSuggestions(query: string, isFocused: boolean = true) {
  const [loading, setLoading] = useState(false)
  const [apiSuggestions, setApiSuggestions] = useState<SearchSuggestion[]>([])
  const [localSuggestions, setLocalSuggestions] = useState<SearchSuggestion[]>([])

  // Load local suggestions from localStorage and listen for changes
  useEffect(() => {
    // Initial load
    const history = getSearchHistory()
    setLocalSuggestions(history)

    // Listen for changes
    const handleStorageChange = () => {
      console.log('Search history updated, reloading...')
      const updatedHistory = getSearchHistory()
      setLocalSuggestions(updatedHistory)
    }

    window.addEventListener('search-history-updated', handleStorageChange)
    return () => {
      window.removeEventListener('search-history-updated', handleStorageChange)
    }
  }, [])

  // Filter local suggestions based on query
  const filteredLocalSuggestions = useMemo(() => {
    if (!query) return localSuggestions
    const lowerQuery = query.toLowerCase()
    const filtered = localSuggestions.filter(suggestion => 
      suggestion.displayName.toLowerCase().includes(lowerQuery) ||
      suggestion.authors.some(author => author.toLowerCase().includes(lowerQuery)) ||
      suggestion.doi?.toLowerCase().includes(lowerQuery)
    )
    console.log('Filtered local suggestions:', filtered)
    return filtered
  }, [localSuggestions, query])

  // Fetch API suggestions when query changes
  useEffect(() => {
    let mounted = true
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setApiSuggestions([])
        return
      }

      setLoading(true)
      try {
        console.log('Fetching suggestions for query:', query)
        const suggestions = await SearchService.getSuggestions(query)
        console.log('API suggestions received:', suggestions)
        if (mounted) {
          setApiSuggestions(suggestions)
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        if (mounted) {
          setApiSuggestions([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => {
      mounted = false
      clearTimeout(debounceTimer)
    }
  }, [query])

  // Combine suggestions, prioritizing local results
  const suggestions = useMemo(() => {
    console.log('Combining suggestions:', {
      isFocused,
      query,
      localCount: filteredLocalSuggestions.length,
      apiCount: apiSuggestions.length
    })

    if (isFocused === false) return [] // Only return empty if explicitly false
    
    let results: SearchSuggestion[] = []
    
    // Add local suggestions first
    if (!query) {
      results = localSuggestions
    } else {
      results = [...filteredLocalSuggestions]
      
      // Add API suggestions, excluding any that match local suggestions by ID or DOI
      const existingIds = new Set(results.map(s => s.id))
      const existingDois = new Set(results.map(s => s.doi))
      
      const uniqueApiSuggestions = apiSuggestions.filter(s => 
        !existingIds.has(s.id) && !existingDois.has(s.doi)
      )
      
      results.push(...uniqueApiSuggestions)
    }
    
    console.log('Final combined suggestions:', results)
    return results
  }, [isFocused, query, filteredLocalSuggestions, apiSuggestions, localSuggestions])

  // Clear all search history
  const clearSearchHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
    setLocalSuggestions([])
  }

  return {
    loading,
    suggestions,
    hasLocalSuggestions: localSuggestions.length > 0,
    clearSearchHistory
  }
} 