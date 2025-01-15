'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, ChangeEvent, FormEvent } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useSession } from 'next-auth/react'

interface FundingRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'study' | 'funding' | 'nft'

interface StudyInfo {
  title: string
  proposal: string
}

interface FundingInfo {
  amount: number
  supply: number
}

interface NFTInfo {
  image: File | null
}

export function FundingRequestModal({ isOpen, onClose }: FundingRequestModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('study')
  const [studyInfo, setStudyInfo] = useState<StudyInfo>({ title: '', proposal: '' })
  const [fundingInfo, setFundingInfo] = useState<FundingInfo>({ amount: 0, supply: 0 })
  const [nftInfo, setNftInfo] = useState<NFTInfo>({ image: null })
  const router = useRouter()
  const { data: session } = useSession()

  const handleStudySubmit = (e: FormEvent) => {
    e.preventDefault()
    setCurrentStep('funding')
  }

  const handleFundingSubmit = (e: FormEvent) => {
    e.preventDefault()
    setCurrentStep('nft')
  }

  const handleNFTSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // TODO: Implement NFT upload and funding request submission
    router.push('/funding/requests')
    onClose()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'study':
        return (
          <form onSubmit={handleStudySubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Study Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tell us about your research study
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={studyInfo.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setStudyInfo({ ...studyInfo, title: e.target.value })}
                  placeholder="Enter study title"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="proposal" className="block text-sm font-medium text-gray-700">
                  Research Proposal (250 words)
                </label>
                <textarea
                  id="proposal"
                  value={studyInfo.proposal}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setStudyInfo({ ...studyInfo, proposal: e.target.value })}
                  placeholder="Describe your study..."
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full justify-center">
              Continue to Funding
            </Button>
          </form>
        )

      case 'funding':
        return (
          <form onSubmit={handleFundingSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Funding Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Specify your funding requirements
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Funding Amount (RSC)
                </label>
                <input
                  id="amount"
                  type="number"
                  min={0}
                  value={fundingInfo.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFundingInfo({ ...fundingInfo, amount: Number(e.target.value) })}
                  placeholder="Enter amount in ResearchCoin"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="supply" className="block text-sm font-medium text-gray-700">
                  NFT Supply
                </label>
                <input
                  id="supply"
                  type="number"
                  min={1}
                  value={fundingInfo.supply}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFundingInfo({ ...fundingInfo, supply: Number(e.target.value) })}
                  placeholder="Enter number of NFTs to mint"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full justify-center">
              Continue to NFT Art
            </Button>
          </form>
        )

      case 'nft':
        return (
          <form onSubmit={handleNFTSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                NFT Artwork
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload artwork for your funding NFTs
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NFT Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setNftInfo({ image: file })
                            }
                          }}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full justify-center"
              disabled={!nftInfo.image}
            >
              Submit Funding Request
            </Button>
          </form>
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