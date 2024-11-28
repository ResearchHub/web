'use client'

import { useState } from 'react'
import { Star, MessageSquare, ArrowUp, Coins } from 'lucide-react'
import { ReviewRewardModal } from './ReviewRewardModal'

export const PaperReviews = ({ paperId }) => {
  const [rewardModalOpen, setRewardModalOpen] = useState(false)
  
  // Mock data - would come from API
  const reviews = [
    {
      id: 1,
      author: "Dr. Elena Rodriguez",
      rating: 4,
      content: "Excellent methodology and comprehensive literature review...",
      votes: 12,
      comments: 3,
      earnedRsc: 150,
      date: "2024-03-15"
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
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Write Review
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{review.author}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{review.date}</div>
              </div>
              {review.earnedRsc > 0 && (
                <div className="flex items-center space-x-1.5">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-500">
                    Earned {review.earnedRsc} RSC
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-gray-700 mb-4">{review.content}</p>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm">{review.votes}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{review.comments}</span>
              </button>
            </div>
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