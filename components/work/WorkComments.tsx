'use client'

interface WorkCommentsProps {
  workId: number
}

export const WorkComments = ({ workId }: WorkCommentsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center text-gray-500">
        No comments yet. Start the discussion.
      </div>
    </div>
  )
} 