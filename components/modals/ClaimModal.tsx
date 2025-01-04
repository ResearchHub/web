'use client'

import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { SearchInput } from '@/components/Search/SearchInput'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useState } from 'react'
import { cn } from '@/utils/styles'

interface ClaimModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  id: string
  title: string
  authors: string
  journal: string
  year: number
}

const DEMO_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: 'The role of artificial intelligence in modern healthcare systems',
    authors: 'Sarah Johnson, Michael Chen, David Smith',
    journal: 'Nature Medicine',
    year: 2023,
  },
  {
    id: '2',
    title: 'Quantum computing: A new era of computational power',
    authors: 'Robert Brown, Lisa Anderson',
    journal: 'Science',
    year: 2023,
  },
  {
    id: '3',
    title: 'Climate change impacts on global biodiversity',
    authors: 'Emma Wilson, James Taylor, Maria Garcia',
    journal: 'Nature Climate Change',
    year: 2022,
  },
]

export function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedPaper, setSelectedPaper] = useState<SearchResult | null>(null)
  const [showVerification, setShowVerification] = useState(false)

  const handleSearch = (query: string) => {
    if (!query) {
      setResults([])
      setSelectedPaper(null)
      return
    }

    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      setResults(DEMO_RESULTS)
      setIsSearching(false)
    }, 500)
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black/20" aria-hidden="true" />

        <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Claim your paper
            </Dialog.Title>
            <p className="mt-1 text-sm text-gray-500">
              Earn ResearchCoin rewards for open science.
            </p>
          </div>

          <div className="space-y-6">
            <Alert variant="info" className="text-xs">
              <span>ResearchCoin earn potential depends on factors: open access, includes open data, preregistered</span>
            </Alert>

            <div className="space-y-4">
              <SearchInput 
                placeholder="Search for papers to claim..."
                onSearch={handleSearch}
              />

              {isSearching && (
                <div className="animate-pulse space-y-3">
                  <div className="h-20 rounded-lg bg-gray-100" />
                  <div className="h-20 rounded-lg bg-gray-100" />
                  <div className="h-20 rounded-lg bg-gray-100" />
                </div>
              )}

              {!isSearching && results.length > 0 && (
                <div className="space-y-3">
                  {results.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => setSelectedPaper(paper)}
                      className={cn(
                        'w-full rounded-lg border p-4 text-left transition',
                        selectedPaper?.id === paper.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {paper.title}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {paper.authors} • {paper.journal} • {paper.year}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  className="w-full justify-center"
                  disabled={!selectedPaper}
                  onClick={() => setShowVerification(true)}
                >
                  Claim Paper
                </Button>

                {showVerification && (
                  <Alert variant="warning" className="text-xs">
                    <span>Claim paper requires verification. Verify now.</span>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
} 