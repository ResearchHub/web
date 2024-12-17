'use client'

import { useState, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X, Calendar, Filter, FileDown, Check } from 'lucide-react'
import { filterTransactions } from '@/utils/csvExport'
import { sampleTransactions } from '@/store/transactionStore'

interface ExportFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (filters: ExportFilters) => void
  transactionTypes: string[]
}

export interface ExportFilters {
  startDate: string
  endDate: string
  selectedTypes: string[]
}

const PRESET_RANGES = [
  { label: '7D', name: 'Last 7 days', days: 7 },
  { label: '30D', name: 'Last 30 days', days: 30 },
  { label: '90D', name: 'Last 90 days', days: 90 },
  { 
    label: 'YTD', 
    name: 'This year',
    days: 0,
    getDateRange: () => {
      const end = new Date()
      const start = new Date(end.getFullYear(), 0, 1)
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      }
    }
  },
  {
    label: 'ALL',
    name: 'All time',
    days: 0,
    getDateRange: () => {
      const start = new Date('2019-10-01')
      const end = new Date()
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      }
    }
  },
] as const

export function ExportFilterModal({ 
  isOpen, 
  onClose, 
  onExport, 
  transactionTypes 
}: ExportFilterModalProps) {
  const [filters, setFilters] = useState<ExportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    selectedTypes: [...transactionTypes]
  })

  const [activeDatePreset, setActiveDatePreset] = useState<string>('30D')

  const handlePresetRange = (preset: typeof PRESET_RANGES[number]) => {
    setActiveDatePreset(preset.label)
    
    if ('getDateRange' in preset) {
      const range = preset.getDateRange()
      setFilters(prev => ({ ...prev, ...range }))
    } else {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - preset.days)
      
      setFilters(prev => ({
        ...prev,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      }))
    }
  }

  const handleSelectAllTypes = (select: boolean) => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: select ? [...transactionTypes] : []
    }))
  }

  const handleTypeSelection = (type: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isExportDisabled) {
      onExport(filters)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      return
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isExportDisabled) {
      e.preventDefault()
      onExport(filters)
      onClose()
    }
  }

  const filteredTransactionCount = useMemo(() => {
    const filtered = filterTransactions(sampleTransactions, filters)
    return filtered.length
  }, [filters])

  const isExportDisabled = filters.selectedTypes.length === 0 || filteredTransactionCount === 0

  const getHelperText = () => {
    if (filters.selectedTypes.length === 0) {
      return 'Please select at least one transaction type'
    }
    if (filteredTransactionCount === 0) {
      return 'No transactions found for selected dates'
    }
    return ''
  }

  const sortedTransactionTypes = useMemo(() => {
    return [...transactionTypes].sort()
  }, [transactionTypes])

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
            <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileDown className="h-6 w-6 text-primary-400" />
                  <Dialog.Title className="text-xl font-semibold text-gray-800">
                    Export Transactions
                  </Dialog.Title>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form 
                onSubmit={handleSubmit} 
                onKeyDown={handleKeyDown}
                className="space-y-6"
              >
                {/* Date Range Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-800">
                      <Calendar className="h-5 w-5" />
                      <h3 className="font-medium">Date Range</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Transactions:</span>
                      <span className={`px-2 py-0.5 rounded-md text-sm font-medium
                        ${filteredTransactionCount > 0 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {filteredTransactionCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="inline-flex p-1 gap-1 bg-gray-50 rounded-lg">
                    {PRESET_RANGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetRange(preset)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all
                          ${activeDatePreset === preset.label
                            ? 'bg-white text-primary-400 shadow-sm'
                            : 'text-gray-600 hover:text-primary-400'
                          }`}
                        title={preset.name}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => {
                          setActiveDatePreset('')
                          setFilters(prev => ({ ...prev, startDate: e.target.value }))
                        }}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm
                          focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all"
                      />
                    </div>
                    <div className="flex items-center text-gray-400">to</div>
                    <div className="flex-1">
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => {
                          setActiveDatePreset('')
                          setFilters(prev => ({ ...prev, endDate: e.target.value }))
                        }}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm
                          focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Transaction Types Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-800">
                      <Filter className="h-5 w-5" />
                      <h3 className="font-medium">Transaction Types</h3>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectAllTypes(false)}
                        className="text-sm text-gray-500 hover:text-gray-600"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAllTypes(true)}
                        className="text-sm text-primary-400 hover:text-primary-500"
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-2 
                    scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
                    {sortedTransactionTypes.map((type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md 
                          hover:bg-gray-50 cursor-pointer group transition-colors
                          ${filters.selectedTypes.includes(type) ? 'bg-primary-50' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.selectedTypes.includes(type)}
                          onChange={() => handleTypeSelection(type)}
                          className="hidden"
                        />
                        <div className={`flex-shrink-0 w-4 h-4 rounded border 
                          transition-colors flex items-center justify-center
                          ${filters.selectedTypes.includes(type)
                            ? 'bg-primary-400 border-primary-400'
                            : 'border-gray-300 group-hover:border-primary-400'
                          }`}
                        >
                          {filters.selectedTypes.includes(type) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700 truncate">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="min-w-[240px]">
                    {isExportDisabled && (
                      <p className="text-xs text-gray-400">
                        {getHelperText()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white 
                        border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isExportDisabled}
                      className={`px-5 py-2.5 text-sm font-medium text-white 
                        rounded-lg transition-all flex items-center gap-2
                        ${isExportDisabled 
                          ? 'bg-gray-200 cursor-not-allowed opacity-60' 
                          : 'bg-primary-400 hover:bg-primary-500'
                        }`}
                    >
                      <FileDown className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
} 