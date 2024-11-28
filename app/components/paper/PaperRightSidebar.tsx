import { Eye, Quote, MessageSquare } from 'lucide-react'

export const PaperRightSidebar = ({ paper }) => {
  return (
    <div className="w-80 fixed right-0 top-0 bottom-0 border-l bg-white/50 backdrop-blur-sm p-6 overflow-y-auto">
      {/* Paper Metrics */}
      <div className="mt-16 mb-8">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Paper Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center space-x-1 text-gray-500 mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Views</span>
            </div>
            <span className="text-lg font-medium">{paper.metrics.views}</span>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gray-500 mb-1">
              <Quote className="h-4 w-4" />
              <span className="text-sm">Citations</span>
            </div>
            <span className="text-lg font-medium">{paper.metrics.citations}</span>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gray-500 mb-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Comments</span>
            </div>
            <span className="text-lg font-medium">{paper.metrics.comments}</span>
          </div>
        </div>
      </div>

      {/* RSC Contributors */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Top Contributors</h3>
        <div className="space-y-3">
          {/* Example contributors - you'll need to add this to your data model */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div>
              <div className="text-sm font-medium">Alice Chen</div>
              <div className="text-xs text-gray-500">500 RSC</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div>
              <div className="text-sm font-medium">Bob Smith</div>
              <div className="text-xs text-gray-500">350 RSC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 