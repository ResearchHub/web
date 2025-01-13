'use client'

interface WorkReviewsProps {
  workId: number
}

export const WorkReviews = ({ workId }: WorkReviewsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center text-gray-500">
        No reviews yet. Be the first to review this work.
      </div>
    </div>
  )
} 