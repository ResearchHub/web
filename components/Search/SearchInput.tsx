import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/form/Input'
import { useState } from 'react'
import { cn } from '@/utils/styles'

interface SearchInputProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  iconPosition?: 'left' | 'right'
}

export function SearchInput({ 
  placeholder = 'Search...', 
  onSearch, 
  className,
  iconPosition = 'left' 
}: SearchInputProps) {
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

  const searchIcon = (
    <div className="flex items-center rounded-lg border-l border-gray-200 bg-gray-100 hover:bg-gray-200 transition-colors px-4" style={{ borderRadius: '0 0.5rem 0.5rem 0'  }}>
      <Search className="h-4 w-4" />
    </div>
  )

  return (
    <Input
      value={query}
      onChange={handleChange}
      placeholder={placeholder}
      icon={iconPosition === 'left' ? searchIcon : undefined}
      rightElement={
        query ? (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 px-3"
          >
            <X className="h-4 w-4" />
          </button>
        ) : iconPosition === 'right' ? searchIcon : null
      }
      className={cn(
        'placeholder:text-gray-500',
        className
      )}
    />
  )
} 