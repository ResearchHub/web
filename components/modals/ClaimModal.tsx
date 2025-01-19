'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Search } from '@/components/Search/Search'
import { Button } from '@/components/ui/Button'
import { useSession } from 'next-auth/react'
import { SearchSuggestion } from '@/types/search'
interface ClaimModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'search' | 'verify'

export function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('search')
  const [selectedPaper, setSelectedPaper] = useState<SearchSuggestion | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    setSelectedPaper(suggestion)
    setCurrentStep('verify')
  }

  const handleVerifyProfile = () => {
    // TODO: Implement profile verification flow
    if (selectedPaper?.id) {
      router.push(`/profile/verify?paper_id=${selectedPaper.id}`)
    } else if (selectedPaper?.doi) {
      router.push(`/profile/verify?doi=${encodeURIComponent(selectedPaper.doi)}`)
    }
    onClose()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Search for your paper
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter your paper's DOI or search by title to claim it and earn ResearchCoin
              </p>
            </div>

            <Search onSelect={handleSearchSelect} />
          </div>
        )

      case 'verify':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Verify Your Profile
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                To claim your paper and earn ResearchCoin, we need to verify your identity
              </p>
            </div>

            {selectedPaper && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{selectedPaper.displayName}</h4>
                {selectedPaper.doi && (
                  <p className="text-sm text-gray-500 mt-1">DOI: {selectedPaper.doi}</p>
                )}
                {selectedPaper.authors.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Authors: {selectedPaper.authors.join(', ')}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleVerifyProfile}
              className="w-full justify-center"
            >
              Continue to Verification
            </Button>
          </div>
        )
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {renderStepContent()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 