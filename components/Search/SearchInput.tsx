import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/form/Input'
import { useState } from 'react'

interface SearchInputProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export function SearchInput({ placeholder = 'Search...', onSearch, className }: SearchInputProps) {
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch?.(value)
  }

  const handleClear = () => {
    setQuery('')
    onSearch?.('')
  }

  return (
    <Input
      value={query}
      onChange={handleChange}
      placeholder={placeholder}
      icon={<Search className="h-4 w-4" />}
      rightElement={
        query ? (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null
      }
      className={className}
    />
  )
} 