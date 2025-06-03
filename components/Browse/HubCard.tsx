'use client';

import { BrowseHub } from '@/store/browseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, UserCheck, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface HubCardProps {
  hub: BrowseHub;
}

export const HubCard: React.FC<HubCardProps> = ({ hub }) => {
  const [isFollowing, setIsFollowing] = useState(hub.isFollowing || false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement actual follow/unfollow API call
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="group hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col relative">
        {/* Journal Badge */}
        {hub.type === 'journal' && (
          <div className="absolute top-3 right-3 z-10">
            <div className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
              <BookOpen className="h-3 w-3 inline mr-1" />
              Journal
            </div>
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col">
          {/* Centered Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-200 transition-colors flex items-center justify-center">
                {/* Handle both emoji and URL avatars */}
                {hub.avatar.startsWith('http') ? (
                  <img
                    src={hub.avatar}
                    alt={hub.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Fallback to hub name initials if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="text-2xl font-bold text-gray-600">
                          ${hub.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="text-2xl">{hub.avatar}</div>
                )}
              </div>
            </div>
          </div>

          {/* Centered Name */}
          <div className="text-center mb-3 min-h-[3.5rem] flex items-center justify-center">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
              {hub.name}
            </h3>
          </div>

          {/* Centered Headline */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed text-center">
            {hub.headline}
          </p>

          {/* Details - Line Items - Takes remaining space */}
          <div className="space-y-2 text-xs text-gray-600 mb-4 flex-1">
            {/* Followers */}
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3 text-indigo-500 flex-shrink-0" />
              <span>{formatNumber(hub.followerCount)} followers</span>
            </div>
          </div>

          {/* Follow Button - Always at bottom */}
          <div className="mt-auto">
            <Button
              variant={isFollowing ? 'outlined' : 'default'}
              size="sm"
              onClick={handleFollow}
              className="w-full"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-3 w-3 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <Users className="h-3 w-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
