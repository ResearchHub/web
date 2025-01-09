import { useEffect, useState } from 'react'
import { SearchService } from '@/services/search.service'
import type { SearchSuggestion } from '@/services/types/search.dto'
import { transformSearchSuggestion } from '@/services/types/search.dto'
import { FileText } from 'lucide-react'

interface SearchSuggestionsProps {
  query: string
  onSelect?: (suggestion: SearchSuggestion) => void
}

export function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await SearchService.getSuggestions(query)
        setSuggestions(response.map(transformSearchSuggestion))
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 800)
    return () => clearTimeout(debounceTimer)
  }, [query])

  if (!query || loading || suggestions.length === 0) {
    return null
  }

  return (
    <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
      <ul className="py-2 max-h-96 overflow-auto">
        {suggestions.map((suggestion) => (
          <li key={suggestion.doi}>
            <button
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => onSelect?.(suggestion)}
            >
              <div className="flex items-start gap-3">
                {suggestion.entityType === 'work' && (
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
        ))}
      </ul>
    </div>
  )
} 