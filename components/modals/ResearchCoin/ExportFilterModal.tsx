'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X, Calendar, FileDown } from 'lucide-react'
import { TransactionDTO } from '@/services/types/transaction.dto'
import { TransactionService } from '@/services/transaction.service'
import toast from 'react-hot-toast'
import { exportTransactionsToCSV } from '@/components/ResearchCoin/lib/transactionCSVExport';

interface ExportFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (transactions: TransactionDTO[]) => void
}

export interface ExportFilters {
  startDate: string
  endDate: string
}

const PRESET_RANGES = [
  {
    label: '2024',
    name: '2024',
    getDateRange: () => ({
      startDate: '2024-01-01',
      endDate: formatDateForInput(new Date())
    })
  },
  {
    label: '2023',
    name: '2023',
    getDateRange: () => ({
      startDate: '2023-01-01',
      endDate: '2023-12-31'
    })
  },
  {
    label: '2022',
    name: '2022',
    getDateRange: () => ({
      startDate: '2022-01-01',
      endDate: '2022-12-31'
    })
  },
  {
    label: '2021',
    name: '2021',
    getDateRange: () => ({
      startDate: '2021-01-01',
      endDate: '2021-12-31'
    })
  },
  {
    label: '2020',
    name: '2020',
    getDateRange: () => ({
      startDate: '2020-01-01',
      endDate: '2020-12-31'
    })
  },
  {
    label: '2019',
    name: '2019',
    getDateRange: () => ({
      startDate: '2019-10-01', // ResearchHub launch date
      endDate: '2019-12-31'
    })
  }
] as const

// Helper function to format dates consistently for input fields
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Helper function to get local date range
const getDateRange = (daysAgo: number): { startDate: string; endDate: string } => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - daysAgo)
  
  return {
    startDate: formatDateForInput(start),
    endDate: formatDateForInput(end),
  }
}

export function ExportFilterModal({ isOpen, onClose, onExport }: ExportFilterModalProps) {
  // Initialize with current year
  const currentYear = new Date().getFullYear().toString()
  const currentYearRange = PRESET_RANGES.find(r => r.label === currentYear)?.getDateRange()
  
  const [filters, setFilters] = useState<ExportFilters>(
    currentYearRange || {
      startDate: `${currentYear}-01-01`,
      endDate: formatDateForInput(new Date())
    }
  )
  const [activeDatePreset, setActiveDatePreset] = useState<string>(currentYear)
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handlePresetRange = (preset: typeof PRESET_RANGES[number]) => {
    setActiveDatePreset(preset.label)
    
    if ('getDateRange' in preset) {
      const range = preset.getDateRange()
      setFilters(range)
    } else {
      const range = getDateRange(preset.days)
      setFilters(range)
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      toast.dismiss()
      toast.error('Export cancelled')
      onClose()
    }
  }

  const handleModalClose = () => {
    if (!isLoading) {
      onClose()
    } else {
      // If export is in progress, just close the modal without cancelling
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setIsLoading(true)
      const loadingToast = toast.loading(
        <div className="flex items-center justify-between gap-4">
          <span>Starting export...</span>
          <button
            onClick={() => handleCancel()}
            className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 
              rounded hover:bg-red-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      )
      
      // Create date objects and set to start/end of day
      const startDateObj = new Date(filters.startDate)
      startDateObj.setUTCHours(0, 0, 0, 0)
      
      const endDateObj = new Date(filters.endDate)
      endDateObj.setUTCHours(23, 59, 59, 999)

      // Format dates for API
      const apiStartDate = startDateObj.toISOString().split('T')[0]
      const apiEndDate = endDateObj.toISOString().split('T')[0]
      
      // First get total count with a small page size
      const firstPageResponse = await TransactionService.getFilteredTransactions({
        startDate: apiStartDate,
        endDate: apiEndDate,
        page: 1,
        pageSize: 25,
        signal: controller.signal
      })

      if (!firstPageResponse.results?.length) {
        toast.dismiss(loadingToast)
        toast.error('No transactions found for the selected dates')
        return
      }

      let allTransactions: TransactionDTO[] = []
      let currentPage = 1
      let consecutiveFailures = 0
      const MAX_CONSECUTIVE_FAILURES = 3
      let hasMorePages = true

      while (hasMorePages && consecutiveFailures < MAX_CONSECUTIVE_FAILURES && !controller.signal.aborted) {
        try {
          toast.loading(
            <div className="flex items-center justify-between gap-4">
              <span>Exported {allTransactions.length.toLocaleString()} transactions...</span>
              <button
                onClick={() => handleCancel()}
                className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 
                  rounded hover:bg-red-100 transition-colors"
              >
                Cancel
              </button>
            </div>,
            { id: loadingToast }
          )

          const response = await TransactionService.getFilteredTransactions({
            startDate: apiStartDate,
            endDate: apiEndDate,
            page: currentPage,
            pageSize: 10,
            signal: controller.signal
          })
          
          if (response.results?.length) {
            // Filter transactions by date range client-side as backup
            const validTransactions = response.results.filter(tx => {
              const txDate = new Date(tx.created_date)
              return txDate >= startDateObj && txDate <= endDateObj
            })

            if (validTransactions.length > 0) {
              allTransactions = [...allTransactions, ...validTransactions]
              consecutiveFailures = 0 // Reset failure counter on success
            } else {
              // No valid transactions in this page
              consecutiveFailures++
            }
          } else {
            // No results in this page
            consecutiveFailures++
          }
          
          hasMorePages = !!response.next && response.results?.length > 0
          currentPage++
          
          // Add small delay between requests
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, 200)
            controller.signal.addEventListener('abort', () => {
              clearTimeout(timeout)
              reject(new Error('Export cancelled'))
            })
          })
        } catch (error) {
          if (error instanceof Error && error.message === 'Export cancelled') {
            throw error
          }
          
          console.error(`Failed to fetch page ${currentPage}:`, error)
          consecutiveFailures++
          
          if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            toast.loading(
              <div className="flex items-center justify-between gap-4">
                <span>Export encountered errors. Proceeding with {allTransactions.length.toLocaleString()} transactions...</span>
                <button
                  onClick={() => handleCancel()}
                  className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 
                    rounded hover:bg-red-100 transition-colors"
                >
                  Cancel
                </button>
              </div>,
              { id: loadingToast }
            )
            break
          } else {
            // Log the error but continue with next page
            console.warn(`Skipping problematic page ${currentPage}, continuing with next page`)
            currentPage++
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(resolve, 500)
              controller.signal.addEventListener('abort', () => {
                clearTimeout(timeout)
                reject(new Error('Export cancelled'))
              })
            })
          }
        }
      }

      if (controller.signal.aborted) {
        throw new Error('Export cancelled')
      }

      if (allTransactions.length === 0) {
        toast.dismiss(loadingToast)
        toast.error('No transactions found for the selected dates')
        return
      }

      // Sort transactions by date before export
      allTransactions.sort((a, b) => 
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      )

      // Export filtered transactions
      exportTransactionsToCSV(allTransactions, filters.startDate, filters.endDate)
      
      toast.success(
        `Successfully exported ${allTransactions.length.toLocaleString()} transactions`,
        { id: loadingToast }
      )
      onClose()
    } catch (error) {
      if (error instanceof Error && error.message === 'Export cancelled') {
        return
      }
      console.error('Failed to export transactions:', error)
      toast.error('Failed to export transactions')
    } finally {
      setIsLoading(false)
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      return
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleModalClose}>
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
                  onClick={handleModalClose}
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
                  <div className="flex items-center gap-2 text-gray-800">
                    <Calendar className="h-5 w-5" />
                    <h3 className="font-medium">Date Range</h3>
                  </div>
                  
                  <div className="inline-flex p-1 gap-1 bg-gray-50 rounded-lg flex-wrap">
                    {PRESET_RANGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetRange(preset)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all min-w-[80px]
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

                {/* Action Buttons */}
                <div className="flex items-center justify-end pt-4 border-t gap-3">
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-2.5 text-sm font-medium text-red-600 bg-white 
                        border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                    >
                      Cancel Export
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white 
                        border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Close
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-5 py-2.5 text-sm font-medium text-white 
                      rounded-lg transition-all flex items-center gap-2
                      ${isLoading 
                        ? 'bg-gray-200 cursor-not-allowed opacity-60' 
                        : 'bg-primary-400 hover:bg-primary-500'
                      }`}
                  >
                    <FileDown className="h-4 w-4" />
                    {isLoading ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
} 