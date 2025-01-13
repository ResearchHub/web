'use client'

interface WorkRewardsProps {
  workId: number
}

export const WorkRewards = ({ workId }: WorkRewardsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center text-gray-500">
        No active rewards for this work.
      </div>
    </div>
  )
} 