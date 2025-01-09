'use client'

import { Dialog, Transition, RadioGroup } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { XIcon, Trophy, FileSearch, Repeat, Sparkles, Star } from 'lucide-react'

const REWARD_TYPES = [
  { 
    id: 'peer-review', 
    name: 'Peer Review', 
    description: 'Reward for conducting peer reviews',
    icon: <Star className="w-5 h-5" />,
    hint: 'Add paper URL or DOI for review'
  },
  { 
    id: 'replication', 
    name: 'Replication', 
    description: 'Reward for replicating research',
    icon: <Repeat className="w-5 h-5" />,
  },
  { 
    id: 'other', 
    name: 'Something Else', 
    description: 'For answering questions, expert analysis, methodology help, datasets, or code implementation',
    icon: <Sparkles className="w-5 h-5" />,
  },
]

interface CreateRewardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateRewardModal({ isOpen, onClose }: CreateRewardModalProps) {
  const [selectedType, setSelectedType] = useState(REWARD_TYPES[0])
  const [summary, setSummary] = useState('')
  const [amount, setAmount] = useState('')
  const [details, setDetails] = useState('')
  const userBalance = 15000 // Hardcoded balance
  const [paperUrl, setPaperUrl] = useState('')
  const RSC_TO_USD = 0.50; // Hardcoded exchange rate: 1 RSC = $0.50 USD
  
  const getUsdValue = (rsc: string) => {
    const value = parseFloat(rsc) || 0;
    return (value * RSC_TO_USD).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={onClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-indigo-600" />
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      Create ResearchCoin Reward
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-base font-semibold text-gray-900">
                        Reward Type
                      </label>
                      <RadioGroup value={selectedType} onChange={setSelectedType} className="mt-2">
                        <div className="space-y-2">
                          {REWARD_TYPES.map((type) => (
                            <RadioGroup.Option
                              key={type.id}
                              value={type}
                              className={({ active, checked }) =>
                                `${active ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}
                                ${checked ? 'bg-indigo-600 text-white' : 'bg-white'}
                                relative flex cursor-pointer rounded-lg px-5 py-4 border focus:outline-none`
                              }
                            >
                              {({ checked }) => (
                                <div className="flex w-full items-center">
                                  <div className={`${checked ? 'text-white' : 'text-indigo-600'} mr-4`}>
                                    {type.icon}
                                  </div>
                                  <div className="flex items-center">
                                    <div className="text-sm">
                                      <RadioGroup.Label
                                        as="p"
                                        className={`font-medium ${
                                          checked ? 'text-white' : 'text-gray-900'
                                        }`}
                                      >
                                        {type.name}
                                      </RadioGroup.Label>
                                      <RadioGroup.Description
                                        as="span"
                                        className={`inline ${
                                          checked ? 'text-indigo-100' : 'text-gray-500'
                                        }`}
                                      >
                                        {type.description}
                                      </RadioGroup.Description>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </RadioGroup.Option>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {selectedType.id === 'peer-review' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Paper URL or DOI
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            value={paperUrl}
                            onChange={(e) => setPaperUrl(e.target.value)}
                            className="block w-full rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm px-4 py-3 h-[44px]"
                            placeholder="https://doi.org/..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Short Summary
                    </label>
                    <div className="mt-1">
                      <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        maxLength={140}
                        rows={2}
                        className="block w-full rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm px-4 py-3 h-[80px] resize-none"
                        placeholder="Summarize what you need in 140 characters or less"
                      />
                      <p className="mt-1 text-sm text-gray-500">{140 - summary.length} characters remaining</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Amount Offered
                      </label>
                      <div className="text-sm text-gray-500">
                        Balance: <span className="font-medium">{userBalance.toLocaleString()} RSC</span>
                        <span className="text-gray-400 ml-1">
                          (${(userBalance * RSC_TO_USD).toLocaleString()})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full rounded-lg bg-gray-50 border border-gray-200 pl-4 pr-12 py-3 h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                            placeholder="0.00"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <span className="text-gray-500 sm:text-sm">RSC</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 h-[44px] border border-indigo-600 text-sm font-medium rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                          onClick={() => {
                            // Integrate Coinbase onRamp here
                            console.log('Buy ResearchCoin')
                          }}
                        >
                          Buy ResearchCoin
                        </button>
                      </div>
                      {amount && (
                        <div className="text-sm text-gray-500 text-right">
                          ≈ ${getUsdValue(amount)} USD
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Details
                    </label>
                    <div className="mt-1">
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        rows={6}
                        className="block w-full rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm px-4 py-3 h-[160px] resize-none"
                        placeholder="Provide additional details and relevant resources..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Create Reward
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 