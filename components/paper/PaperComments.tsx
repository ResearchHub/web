'use client'

import { useState } from 'react'
import { ArrowUp, MessageSquare, CircleUser } from 'lucide-react'

export const PaperComments = ({ paperId }) => {
  const [newComment, setNewComment] = useState('')

  // Mock data - would come from API
  const comments = [
    {
      id: 1,
      user: "Alex Thompson",
      content: "Interesting findings regarding the role of deoxysphingolipids. Has anyone attempted to replicate these results in different cell lines?",
      votes: 15,
      replies: 3,
      timestamp: "2 days ago"
    },
    {
      id: 2,
      user: "Dr. Maria Garcia",
      content: "The methodology is sound, but I wonder about the potential implications for therapeutic applications. Would be great to see follow-up studies addressing this.",
      votes: 8,
      replies: 1,
      timestamp: "1 day ago"
    },
    {
      id: 3,
      user: "James Wilson",
      content: "Figure 3 shows some promising results. I'd be interested in seeing how these findings compare to previous studies in the field.",
      votes: 5,
      replies: 0,
      timestamp: "5 hours ago"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <CircleUser className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <CircleUser className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{comment.user}</span>
                  <span className="text-sm text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-gray-700 mb-4">{comment.content}</p>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-sm">{comment.votes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">{comment.replies}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 