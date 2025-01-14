import { useEffect, useState } from 'react'
import type { SearchSuggestion } from '@/services/types/search.dto'
import { FileText, History, Search, X, Lightbulb } from 'lucide-react'
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions'

interface SearchSuggestionsProps {
  query: string
  isFocused?: boolean
  onSelect?: (suggestion: SearchSuggestion) => void
}

const searchTips = [
  "Search by keyword or DOI",
  "Use quotes for exact matches",
  "Filter by author using 'author:'",
]

export function SearchSuggestions({ query, isFocused = true, onSelect }: SearchSuggestionsProps) {
  const [tipIndex, setTipIndex] = useState(0)
  const { loading, suggestions, hasLocalSuggestions, clearSearchHistory } = useSearchSuggestions(query, isFocused)

  console.log('SearchSuggestions render:', { loading, suggestionsCount: suggestions.length, hasLocalSuggestions, isFocused })

  // Rotate through tips
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((current) => (current + 1) % searchTips.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Only hide when explicitly not focused
  if (isFocused === false) {
    return null
  }

  const renderSuggestion = (suggestion: SearchSuggestion) => (
    <li key={suggestion.doi || suggestion.id}>
      <button
        type="button"
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={() => onSelect?.(suggestion)}
      >
        <div className="flex items-start gap-3">
          {suggestion.isRecent ? (
            <History className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          ) : (
            <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <div className="font-medium text-sm">{suggestion.displayName}</div>
            <div className="text-xs text-gray-500">
              {suggestion.authors.slice(0, 3).join(', ')}
              {suggestion.authors.length > 3 ? ', et al.' : ''}
            </div>
          </div>
        </div>
      </button>
    </li>
  )

  return (
    <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
      {/* Local suggestions section */}
      {!query && hasLocalSuggestions && (
        <div>
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-xs font-medium text-gray-500">Recent</span>
            <button
              onClick={clearSearchHistory}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
          <ul className="py-2">
            {suggestions.map(renderSuggestion)}
          </ul>
        </div>
      )}

      {/* Combined results section */}
      {query && (
        <>
          {loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Loading results...
            </div>
          )}
          
          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results found
            </div>
          )}

          {suggestions.length > 0 && (
            <ul className="py-2">
              {suggestions.map(renderSuggestion)}
            </ul>
          )}
        </>
      )}

      {/* Tips section */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <span>Tip: {searchTips[tipIndex]}</span>
        </div>
      </div>
    </div>
  )
} 