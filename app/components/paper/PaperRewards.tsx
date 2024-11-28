'use client'

import { Coins, Clock, ArrowUp, MessageSquare } from 'lucide-react'

export const PaperRewards = ({ paperId }) => {
  // Mock data - would come from API
  const rewards = [
    {
      id: 1,
      type: 'peer_review',
      title: 'Comprehensive Methodology Review',
      description: 'Looking for an expert review focusing on the methodology and statistical analysis.',
      amount: 500,
      deadline: '7 days',
      status: 'open',
      requirements: 'PhD in related field',
      created_by: 'Dr. Sarah Chen',
      created_at: '2024-03-15'
    },
    {
      id: 2,
      type: 'replication',
      title: 'Replication Study',
      description: 'Seeking researchers to replicate key findings from Figure 3.',
      amount: 1500,
      deadline: '30 days',
      status: 'open',
      requirements: 'Access to required equipment',
      created_by: 'Prof. James Wilson',
      created_at: '2024-03-10'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Open Rewards</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Create Reward
        </button>
      </div>

      <div className="space-y-4">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
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
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 