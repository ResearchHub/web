'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Search } from '@/components/Search/Search'
import { Button } from '@/components/ui/Button'
import type { SearchSuggestion } from '@/services/types/search.dto'

interface SubmitResearchModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'intro' | 'search'

export function SubmitResearchModal({ isOpen, onClose }: SubmitResearchModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('intro')
  const router = useRouter()

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.id) {
      router.push(`/notebook/new?paper_id=${suggestion.id}`)
    } else if (suggestion.doi) {
      router.push(`/notebook/new?doi=${encodeURIComponent(suggestion.doi)}`)
    }
    onClose()
  }

  const handleContinueWithoutDOI = () => {
    router.push('/notebook/new')
    onClose()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">
                Share Your Research with the World
              </h3>
              <p className="mt-2 text-gray-600">
                Join the open science movement and earn ResearchCoin rewards for
                contributing to scientific knowledge.
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-6 space-y-4">
              <h4 className="font-medium text-indigo-900">Why publish on ResearchHub?</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
                    1
                  </div>
                  <p className="text-sm text-indigo-900">
                    Earn ResearchCoin rewards for open science practices
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
                    2
                  </div>
                  <p className="text-sm text-indigo-900">
                    Get feedback from the scientific community
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
                    3
                  </div>
                  <p className="text-sm text-indigo-900">
                    Increase visibility and impact of your work
                  </p>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => setCurrentStep('search')}
              className="w-full justify-center"
            >
              Get Started
            </Button>
          </div>
        )

      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Search for your paper
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter your paper's DOI or search by title
              </p>
            </div>

            <Search onSelect={handleSearchSelect} />

            <div className="text-center">
              <span className="text-sm text-gray-500">or</span>
            </div>

            <Button
              variant="outlined"
              onClick={handleContinueWithoutDOI}
              className="w-full justify-center"
            >
              Continue without DOI
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
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              <div className="absolute right-4 top-4">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4">
                {renderStepContent()}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
} 