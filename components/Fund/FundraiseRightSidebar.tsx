'use client'

import { ArrowUp, MessageSquare } from 'lucide-react'

interface FundraiseRightSidebarProps {
  votes: number
  comments: number
}

export function FundraiseRightSidebar({ votes, comments }: FundraiseRightSidebarProps) {
  return (
    <div className="flex items-center space-x-4 text-gray-500">
      <button className="flex items-center space-x-1 hover:text-gray-700">
        <ArrowUp className="h-5 w-5" />
        <span>{votes}</span>
      </button>
      <button className="flex items-center space-x-1 hover:text-gray-700">
        <MessageSquare className="h-5 w-5" />
        <span>{comments}</span>
      </button>
    </div>
  )
} 