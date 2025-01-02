'use client'

import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { SearchInput } from '@/components/Search/SearchInput'
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon'

interface ClaimModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
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
              Claim your research
            </Dialog.Title>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Claim your research papers
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Search for your published papers and claim them to start earning ResearchCoin rewards
              </p>
              <div className="inline-flex items-center gap-1 text-xs text-orange-500 font-medium">
                <span>*Earn up to 100</span>
                <ResearchCoinIcon size={16} color="#F97316" />
                <span>per verified claim</span>
              </div>
            </div>
            
            <SearchInput 
              placeholder="Search for papers to claim..."
              onSearch={(query) => {
                // Handle search
                console.log(query)
              }}
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
} 