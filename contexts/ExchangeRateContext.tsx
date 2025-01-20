'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { ExchangeRateService } from '@/services/exchangeRate.service'

interface ExchangeRateContextType {
  exchangeRate: number
  isLoading: boolean
  error: Error | null
}

const ExchangeRateContext = createContext<ExchangeRateContextType>({
  exchangeRate: 0,
  isLoading: true,
  error: null
})

export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  const [exchangeRate, setExchangeRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        const rate = await ExchangeRateService.getLatestRate()
        setExchangeRate(rate)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch exchange rate'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchExchangeRate()
  }, [])

  return (
    <ExchangeRateContext.Provider value={{ exchangeRate, isLoading, error }}>
      {children}
    </ExchangeRateContext.Provider>
  )
}

export function useExchangeRate() {
  const context = useContext(ExchangeRateContext)
  if (context === undefined) {
    throw new Error('useExchangeRate must be used within an ExchangeRateProvider')
  }
  return context
} 