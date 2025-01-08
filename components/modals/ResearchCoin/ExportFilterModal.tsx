'use client'

import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X, Calendar, FileDown } from 'lucide-react'
import { TransactionAPIRequest } from '@/services/types/transaction.dto'
import { TransactionService } from '@/services/transaction.service'
import toast from 'react-hot-toast'
import { exportTransactionsToCSV } from '@/components/ResearchCoin/lib/transactionCSVExport';

// Create context for tracking export state
const ExportContext = createContext<{
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
}>({
  isExporting: false,
  setIsExporting: () => {},
});

// Provider component
export function ExportProvider({ children }: { children: React.ReactNode }) {
  const [isExporting, setIsExporting] = useState(false);
  return (
    <ExportContext.Provider value={{ isExporting, setIsExporting }}>
      {children}
    </ExportContext.Provider>
  );
}

// Hook for using export context
const useExportContext = () => useContext(ExportContext);

interface ExportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ExportFilters {
  startDate: string
  endDate: string
}

const PRESET_RANGES = [
  {
    label: '2025',
    name: '2025',
    getDateRange: () => ({
      startDate: '2025-01-01',
      endDate: formatDateForInput(new Date())
    })
  },
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

export function ExportFilterModal({ isOpen, onClose }: ExportFilterModalProps) {
  // Get export context
  const { isExporting, setIsExporting } = useExportContext();
  
  // Initialize with current year
  const defaultYear = '2025'
  const defaultYearRange = PRESET_RANGES.find(r => r.label === defaultYear)?.getDateRange()
  
  const [filters, setFilters] = useState<ExportFilters>(
    defaultYearRange || {
      startDate: '2025-01-01',
      endDate: formatDateForInput(new Date())
    }
  )
  const [activeDatePreset, setActiveDatePreset] = useState<string>(defaultYear)
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [exportProgress, setExportProgress] = useState<{
    total: number;
    processed: number;
    ratesProcessed: number;
  }>({ total: 0, processed: 0, ratesProcessed: 0 });

  const handlePresetRange = (preset: typeof PRESET_RANGES[number]) => {
    setActiveDatePreset(preset.label)
    
    if ('getDateRange' in preset) {
      const range = preset.getDateRange()
      setFilters(range)
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      setIsExporting(false)
      setExportProgress({ total: 0, processed: 0, ratesProcessed: 0 })
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
    
    if (isExporting) {
      return; // Prevent multiple exports
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setIsLoading(true)
      setIsExporting(true)
      const loadingToast = toast.loading(
        <div className="flex flex-col gap-2">
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
        pageSize: 25
      })

      if (!firstPageResponse.results?.length) {
        toast.dismiss(loadingToast)
        toast.error('No transactions found for the selected dates')
        setIsExporting(false)
        setIsLoading(false)
        return
      }

      let allTransactions: TransactionAPIRequest[] = []
      let currentPage = 1
      let consecutiveFailures = 0
      const MAX_CONSECUTIVE_FAILURES = 3
      let hasMorePages = true

      while (hasMorePages && consecutiveFailures < MAX_CONSECUTIVE_FAILURES && !controller.signal.aborted) {
        try {
          const transactionCount = allTransactions.length
          toast.loading(
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <span>Exporting transactions...</span>
                <button
                  onClick={() => handleCancel()}
                  className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 
                    rounded hover:bg-red-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {transactionCount.toLocaleString()} transactions processed
              </div>
            </div>,
            { id: loadingToast }
          )

          const response = await TransactionService.getFilteredTransactions({
            startDate: apiStartDate,
            endDate: apiEndDate,
            page: currentPage,
            pageSize: 10
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
              setExportProgress(prev => ({ ...prev, processed: allTransactions.length }))
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

      // Export filtered transactions with progress callback
      toast.loading(
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span>Looking up exchange rates...</span>
            <button
              onClick={() => handleCancel()}
              className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 
                rounded hover:bg-red-100 transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="text-xs text-gray-500">
            For {allTransactions.length.toLocaleString()} transactions
          </div>
        </div>,
        { id: loadingToast }
      )

      await exportTransactionsToCSV(
        allTransactions, 
        filters.startDate, 
        filters.endDate,
        (progress: number) => {
          setExportProgress(prev => ({ ...prev, ratesProcessed: progress }));
          toast.loading(
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span>Fetching exchange rates...</span>
                <button
                  onClick={() => handleCancel()}
                  className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 
                    rounded hover:bg-red-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {progress.toLocaleString()} of {allTransactions.length.toLocaleString()} rates fetched
              </div>
            </div>,
            { id: loadingToast }
          )
        }
      )
      
      toast.success(
        <div className="flex flex-col gap-1">
          <div>Successfully exported {allTransactions.length.toLocaleString()} transactions</div>
          <div className="text-xs text-gray-500">
            Exchange rates fetched for {exportProgress.ratesProcessed.toLocaleString()} transactions
          </div>
        </div>,
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
      setIsExporting(false)
      setExportProgress({ total: 0, processed: 0, ratesProcessed: 0 })
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
                    <button 
                      type="button"
                      className="p-1 rounded-md hover:bg-gray-100 group transition-colors"
                    >
                      <Calendar className="h-5 w-5 text-gray-600 group-hover:text-primary-400 transition-colors" />
                    </button>
                    <h3 className="font-medium">Date Range</h3>
                  </div>
                  
                  <div className="inline-flex p-1 gap-1 bg-gray-50 rounded-lg w-full">
                    {PRESET_RANGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetRange(preset)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all min-w-[64px] flex-1
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
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => {
                          setActiveDatePreset('')
                          setFilters(prev => ({ ...prev, startDate: e.target.value }))
                        }}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm
                          focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all pr-10
                          [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute 
                          [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 group transition-colors"
                        onClick={() => {
                          const input = document.querySelector('input[type="date"]') as HTMLInputElement
                          input?.showPicker?.()
                        }}
                      >
                        <Calendar className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                      </button>
                    </div>
                    <div className="flex items-center text-gray-400">to</div>
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => {
                          setActiveDatePreset('')
                          setFilters(prev => ({ ...prev, endDate: e.target.value }))
                        }}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm
                          focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all pr-10
                          [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute 
                          [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 group transition-colors"
                        onClick={() => {
                          const input = document.querySelectorAll('input[type="date"]')[1] as HTMLInputElement
                          input?.showPicker?.()
                        }}
                      >
                        <Calendar className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                      </button>
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
                    disabled={isLoading || isExporting}
                    className={`px-5 py-2.5 text-sm font-medium text-white 
                      rounded-lg transition-all flex items-center gap-2
                      ${(isLoading || isExporting)
                        ? 'bg-gray-200 cursor-not-allowed opacity-60' 
                        : 'bg-primary-400 hover:bg-primary-500'
                      }`}
                  >
                    <FileDown className="h-4 w-4" />
                    {isLoading ? 'Exporting...' : isExporting ? 'Export in Progress...' : 'Export CSV'}
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