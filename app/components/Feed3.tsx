'use client'

import { FC, useState } from 'react';
import { feedEntries } from '@/store/feedStore';
import { FeedEntry } from '@/types/feed';
import {
  MessageCircle,
  Repeat,
  Heart,
  Share,
  MoreHorizontal,
  Coins,
  Award,
  Users,
  FileText,
  ChevronDown,
  Star,
} from 'lucide-react';

const FeedItem: FC<{ entry: FeedEntry }> = ({ entry }) => {
  const { action, actor, timestamp, item, relatedItem } = entry;
  const [showFullDescription, setShowFullDescription] = useState(false);

  const getActionIcon = () => {
    switch (action) {
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'share':
        return <Repeat className="w-4 h-4 text-green-500" />;
      case 'tip':
      case 'contribute':
        return <Coins className="w-4 h-4 text-yellow-500" />;
      case 'reward':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'review':
        return <Star className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={actor.profileImage}
              alt={actor.fullName}
              className="w-10 h-10 rounded-full ring-2 ring-gray-100"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-gray-900">{actor.fullName}</span>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-500 text-sm">{timestamp}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  {getActionIcon()}
                  <span>{action}</span>
                </span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          {relatedItem && (
            <div className="mb-3 text-sm text-gray-500">
              RE: <span className="text-blue-500 hover:underline cursor-pointer">{relatedItem.title}</span>
            </div>
          )}

          {/* Comment content */}
          {item.type === 'comment' && (
            <div className="space-y-4">
              <p className="text-gray-600">{item.content}</p>
              
              {item.parent && (
                <div className="pl-4 border-l-2 border-gray-200">
                  <div className="flex items-start space-x-3">
                    <img
                      src={item.parent.user.profileImage}
                      alt={item.parent.user.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-gray-900">{item.parent.user.fullName}</span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 text-sm">{item.parent.timestamp}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{item.parent.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Funding request content */}
          {item.type === 'funding_request' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg text-gray-900">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{item.amount?.toLocaleString()} RSC raised</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                {item.contributors && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {item.contributors.length} contributors
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paper content */}
          {item.type === 'paper' && (
            <div className="space-y-2">
              <h2 className="font-semibold text-lg text-gray-900">{item.title}</h2>
              <p className={`text-gray-600 ${showFullDescription ? '' : 'line-clamp-3'}`}>
                {item.description}
              </p>
              {!showFullDescription && item.description?.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(true)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center space-x-1"
                >
                  <span>Read more</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{entry.metrics?.comments || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
            <Repeat className="w-5 h-5" />
            <span className="text-sm">{entry.metrics?.reposts || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5" />
            <span className="text-sm">{entry.metrics?.votes || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Feed3: FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      {feedEntries.map((entry) => (
        <FeedItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

export default Feed3; 