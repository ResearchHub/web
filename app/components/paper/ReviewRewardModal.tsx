'use client'

import { Dialog } from '@headlessui/react'
import { Coins, X } from 'lucide-react'

export const ReviewRewardModal = ({ open, onClose, rewards = [] }) => {
  const startReviewWithReward = (rewardId) => {
    // Would integrate with your review form/system
    console.log('Starting review for reward:', rewardId)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold">
              Available Review Rewards
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {rewards?.length > 0 ? (
              rewards.map(reward => (
                <div key={reward.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-5 w-5 text-orange-500" />
                      <span className="font-medium text-orange-500">
                        {reward.amount} RSC
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Due in {reward.deadline}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {reward.requirements}
                  </p>

                  <button
                    onClick={() => startReviewWithReward(reward.id)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Start Review
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No rewards are currently available for this paper
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 