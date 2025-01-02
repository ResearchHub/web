'use client'

import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { PageLayout } from '@/app/layouts/PageLayout'
import { HandCoins } from 'lucide-react'

export default function FundingPage() {
  const [activeTab, setActiveTab] = useState('fund-science')

  const tabs = [
    { id: 'fund-science', label: 'Fund Science' },
    { id: 'grants', label: 'Grants' }
  ]

  return (
    <PageLayout>
      <div>
        <div className="pt-4 pb-7">
          <h2 className="text-lg text-gray-600 flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-indigo-500" />
            Fund breakthrough research shaping tomorrow
          </h2>
        </div>

        <div className="border-b border-gray-100">
          <Tabs 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="mt-8">
          {activeTab === 'fund-science' && (
            <div>
              {/* Fund Science feed will go here */}
            </div>
          )}

          {activeTab === 'grants' && (
            <div>
              {/* Grants feed will go here */}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
