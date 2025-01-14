'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon } from 'lucide-react'
import { SearchSuggestions } from './SearchSuggestions'
import type { SearchSuggestion } from '@/services/types/search.dto'

interface SearchProps {
  onSelect?: (suggestion: SearchSuggestion) => void
}

export function Search({ onSelect }: SearchProps = {}) {
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
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search papers..."
          className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
        />
      </div>

      <SearchSuggestions
        query={query}
        isFocused={isFocused}
        onSelect={handleSelect}
      />
    </div>
  )
} 