import { useState } from 'react'
import { SearchInput } from './SearchInput'
import { SearchSuggestions } from './SearchSuggestions'
import type { SearchSuggestion } from '@/services/types/search.dto'

interface SearchProps {
  placeholder?: string
  className?: string
  onSelect?: (suggestion: SearchSuggestion) => void
}

export function Search({ placeholder, className, onSelect }: SearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSearch = (value: string) => {
    setQuery(value)
    setIsOpen(true)
  }

  const handleSelect = (suggestion: SearchSuggestion) => {
    setIsOpen(false)
    onSelect?.(suggestion)
  }

  return (
    <div className="relative">
      <SearchInput
        placeholder={placeholder}
        onSearch={handleSearch}
        className={className}
      />
      {isOpen && (
        <SearchSuggestions
          query={query}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
} 