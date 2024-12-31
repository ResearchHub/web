'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'

const sortOptions = {
  fund: [
    { id: 'amount', name: 'RSC Amount' },
    { id: 'progress', name: 'Progress' },
    { id: 'newest', name: 'Newest' },
    { id: 'popular', name: 'Popular' }
  ],
  rewards: [
    { id: 'reward', name: 'Reward Amount' },
    { id: 'deadline', name: 'Ending Soon' },
    { id: 'newest', name: 'Newest' },
    { id: 'difficulty', name: 'Difficulty' }
  ],
  grants: [
    { id: 'amount', name: 'Grant Amount' },
    { id: 'deadline', name: 'Deadline' },
    { id: 'newest', name: 'Newest' },
    { id: 'applicants', name: 'Most Applicants' }
  ]
}

interface MarketplaceSortProps {
  activeTab: 'fund' | 'rewards' | 'grants'
  selectedSort: { id: string; name: string }
  setSelectedSort: (sort: { id: string; name: string }) => void
}

export const MarketplaceSort: React.FC<MarketplaceSortProps> = ({
  activeTab,
  selectedSort,
  setSelectedSort,
}) => {
  return (
    <div className="w-48">
      <Listbox value={selectedSort} onChange={setSelectedSort}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-200 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
            <span className="block truncate">{selectedSort.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
              {sortOptions[activeTab].map((option) => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
} 