'use client'

import { 
  ArrowUp, MessageSquare, Bookmark, Share2, CircleUser,
  Coins, BadgeCheck, DollarSign, FileText, Star, Users2
} from 'lucide-react';


export const FeedItem: React.FC<{ item: any }> = ({ item }) => (
    <div className="p-6">
      <div className="flex flex-col">
        <div className="flex items-start mb-3">
          <div className="flex-shrink-0 mr-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <CircleUser className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-900">{item.user}</span>
              {item.verified && <BadgeCheck className="h-4 w-4 text-blue-500 ml-1" />}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {item.type === 'funding_request' && <DollarSign className="h-4 w-4 text-green-500" />}
              {item.type === 'grant' && <DollarSign className="h-4 w-4 text-green-500" />}
              {item.type === 'review' && <Star className="h-4 w-4 text-yellow-400" />}
              {item.type === 'publish' && <FileText className="h-4 w-4 text-blue-500" />}
              <span>
                {item.type === 'funding_request' ? 'Created a funding request' :
                 item.type === 'grant' ? 'Created a grant' :
                 item.type === 'review' ? 'Reviewed a paper' : 'Published a preprint'}
              </span>
              <span>·</span>
              <span>{item.timestamp}</span>
            </div>
          </div>
        </div>
  
        <div className="p-4 rounded-lg border bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
          
          {item.type === 'funding_request' && (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">{item.amount} RSC raised</span>
                    <span className="text-sm text-gray-500">of {item.goal} RSC goal</span>
                  </div>
                  {item.progress === 100 && (
                    <span className="text-sm text-green-500 font-medium">Fundraise Completed</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
  
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white" />
                  ))}
                  <div className="h-6 px-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center ml-1">
                    +{item.contributors} others
                  </div>
                </div>
                <span className="text-sm text-gray-600">contributors</span>
              </div>
  
              <div className="flex">
                <button className="inline-flex items-center justify-center space-x-2 px-6 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-200">
                  <Coins className="h-4 w-4" />
                  <span>Contributors</span>
                </button>
              </div>
            </>
          )}
  
          {item.type === 'grant' && (
            <>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-500">{item.amount} RSC grant</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center space-x-2">
                  <Users2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{item.applicants} applicants</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white" />
                    ))}
                    <div className="h-6 px-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center ml-1">
                      +12 others
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">contributed RSC</span>
                </div>
              </div>
  
              <div className="flex space-x-3">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  Apply Now
                </button>
                <button className="inline-flex items-center justify-center space-x-2 px-6 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-200">
                  <Coins className="h-4 w-4" />
                  <span>Contribute RSC</span>
                </button>
              </div>
            </>
          )}
        </div>
  
        <div className="mt-3 flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
            <ArrowUp className="h-4 w-4" />
            <span className="text-sm">{item.votes}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{item.comments}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
            <Coins className="h-4 w-4" />
            <span className="text-sm">Tip</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
            <Bookmark className="h-4 w-4" />
            <span className="text-sm">Save</span>
          </button>
        </div>
      </div>
    </div>
  );