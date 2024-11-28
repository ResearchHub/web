'use client'

import { LineChart, ArrowUpRight, History } from 'lucide-react'

export const ResearchCoinRightSidebar = () => {
  return (
    <div className="w-80 fixed right-0 h-screen border-l overflow-y-auto p-4">
      {/* Price Chart Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">RSC PRICE</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">$2.00</span>
          <span className="text-sm text-green-600">+5.2%</span>
        </div>
        <div className="h-40 mt-4 bg-gray-50 rounded-lg flex items-center justify-center">
          <LineChart className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">24h Volume</h3>
          <p className="text-lg font-semibold">$1,234,567</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Market Cap</h3>
          <p className="text-lg font-semibold">$50,000,000</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Circulating Supply</h3>
          <p className="text-lg font-semibold">25,000,000 RSC</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">QUICK LINKS</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-gray-600" />
              <span>Trade History</span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-gray-600" />
              <span>Price History</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
} 