'use client'

import { Work } from '@/types/document'
import { Eye, MessageSquare, Star } from 'lucide-react'

interface WorkRightSidebarProps {
  work: Work
}

export const WorkRightSidebar = ({ work }: WorkRightSidebarProps) => {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Metrics</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Review Score</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{work.metrics.reviewScore}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Comments</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{work.metrics.comments}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Reviews</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{work.metrics.reviews}</span>
        </div>
      </div>
    </div>
  )
} 