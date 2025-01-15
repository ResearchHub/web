'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon, X } from 'lucide-react'
import { SearchSuggestions } from './SearchSuggestions'
import type { SearchSuggestion } from '@/services/types/search.dto'
import { cn } from '@/utils/styles'

interface SearchProps {
  onSelect?: (suggestion: SearchSuggestion) => void
  displayMode?: 'dropdown' | 'inline'
  showSuggestionsOnFocus?: boolean
  className?: string
}

export function Search({ 
  onSelect, 
  displayMode = 'dropdown',
  showSuggestionsOnFocus = true,
  className
}: SearchProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the related target is inside our component
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsFocused(false)
    }
  }

  const handleSelect = (suggestion: SearchSuggestion) => {
    // If onSelect is provided, use that instead of default behavior
    if (onSelect) {
      onSelect(suggestion)
      return
    }

    // Default behavior
    if (suggestion.isRecent) {
      router.push(`/work/${suggestion.id}/${suggestion.slug}`)
    } else {
      if (suggestion.id) {
        router.push(`/work/${suggestion.id}/${suggestion.slug}`)
      } else if (suggestion.doi) {
        router.push(`/work?doi=${encodeURIComponent(suggestion.doi)}`)
      }
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search papers..."
          className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-10 text-base focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      <SearchSuggestions
        query={query}
        isFocused={isFocused}
        onSelect={handleSelect}
        displayMode={displayMode}
        showSuggestionsOnFocus={showSuggestionsOnFocus}
      />
    </div>
  )
} 