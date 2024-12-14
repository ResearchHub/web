'use client'

import { useState } from 'react'
import { Coins } from 'lucide-react'
import { ReviewRewardModal } from './ReviewRewardModal'
import { FeedItem } from '../FeedItem'

export const PaperReviews = ({ paperId }) => {
  const [rewardModalOpen, setRewardModalOpen] = useState(false)
  
  // Mock data - would come from API
  const reviews = [
    {
      type: 'review',
      user: 'Dr. Elena Rodriguez',
      organization: 'MIT',
      verified: true,
      timestamp: '2h ago',
      title: 'Review: Revolutionizing Patient Care: Advances in Flexible Printed Heaters',
      description: `The methodology is robust and well-documented, with comprehensive experimental design. 
        The literature review effectively contextualizes the work within the field. 
        However, the discussion of thermal management challenges could be expanded, particularly regarding long-term stability.`,
      votes: 12,
      comments: 3,
      rsc: 350,
      rating: 4
    },
    {
      type: 'review',
      user: 'Prof. Michael Chang',
      organization: 'Stanford University',
      verified: true,
      timestamp: '1d ago',
      title: 'Review: Revolutionizing Patient Care: Advances in Flexible Printed Heaters',
      description: `While the research presents interesting findings in flexible printed heaters, 
        there are some concerns about the reproducibility of the results. The sample size could be larger, 
        and more control experiments would strengthen the conclusions.`,
      votes: 8,
      comments: 5,
      rating: 3
    }
  ]

  const openRewards = [
    {
      id: 1,
      amount: 500,
      deadline: "7 days",
      requirements: "Detailed methodology review",
      claimed: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Review Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <div className="flex space-x-3">
          {openRewards.length > 0 && (
            <button 
              onClick={() => setRewardModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
            >
              <Coins className="h-4 w-4" />
              <span>Review to Earn {openRewards.reduce((sum, r) => sum + r.amount, 0)} RSC</span>
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <FeedItem item={review} />
          </div>
        ))}
      </div>

      <ReviewRewardModal 
        open={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        rewards={openRewards}
      />
    </div>
  )
} 