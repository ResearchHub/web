'use client'

import { Dialog } from '@headlessui/react'
import { Coins, Clock, X } from 'lucide-react'

export const ReviewRewardModal = ({ open, onClose, rewards = [] }) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Open Rewards
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {rewards?.length > 0 ? (
              [
                {
                  id: 1,
                  title: 'Peer Review',
                  description: 'Looking for an expert review focusing on the methodology and statistical analysis.',
                  amount: 500,
                  deadline: '7 days'
                },
                {
                  id: 2,
                  title: 'Replication Study',
                  description: 'Seeking researchers to replicate key findings from Figure 3.',
                  amount: 1500,
                  deadline: '30 days'
                }
              ].map(reward => (
                <div key={reward.id} className="bg-white rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-lg mb-2">{reward.title}</h3>
                      <p className="text-gray-600 mb-4">{reward.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1.5">
                          <Coins className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-orange-500">
                            {reward.amount} RSC
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Due in {reward.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onClose()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No rewards are currently available for this paper
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 