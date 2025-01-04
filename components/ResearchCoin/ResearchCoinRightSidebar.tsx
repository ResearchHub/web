'use client'

import { 
  Coins, 
  GraduationCap,
  Gift,
  Rocket,
  HandCoins,
  ClipboardCheck,
  MessageSquare,
  Microscope,
  ThumbsUp,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export const ResearchCoinRightSidebar = () => {
  return (
    <div className="w-80 fixed right-0 h-screen border-l overflow-y-auto bg-white">
      {/* About Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold">About ResearchCoin</h3>
        </div>
        <p className="text-sm text-gray-600">
          ResearchCoin (RSC) incentivizes good science by allowing users to create grants, 
          reward quality contributions, and fund open science.
        </p>
      </div>

      {/* RSC Utility Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold">RSC Utility</h3>
        </div>
        <div className="space-y-3">
          <Link href="/marketplace/create-reward" 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-indigo-600" />
              <span>Create reward</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link href="/marketplace/fund" 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-indigo-600" />
              <span>Fund open science</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link href="/marketplace/tip" 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <HandCoins className="h-4 w-4 text-indigo-600" />
              <span>Tip authors</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Earning Section */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold">Earning ResearchCoin</h3>
        </div>
        <div className="space-y-3">
          <Link href="/marketplace" 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-indigo-600" />
              <span>Share a peer review</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link href="/marketplace" 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              <span>Answer a grant</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link href="/marketplace" 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <Microscope className="h-4 w-4 text-indigo-600" />
              <span>Do reproducible research</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link href="/marketplace" 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-indigo-600" />
              <span>Get upvotes on your content</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  )
} 