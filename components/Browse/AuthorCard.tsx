'use client';

import { BrowseAuthor } from '@/store/browseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Users, UserCheck, FileText, MapPin, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface AuthorCardProps {
  author: BrowseAuthor;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  const [isFollowing, setIsFollowing] = useState(author.isFollowing || false);

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

  const hasCoauthoredPapers = author.coauthoredPapers && author.coauthoredPapers.length > 0;

  const renderCoauthorTooltip = () => {
    if (!author.coauthoredPapers) return null;

    return (
      <div className="space-y-2">
        <p className="font-medium text-gray-900 text-sm">Coauthored Papers:</p>
        {author.coauthoredPapers.map((paper, index) => (
          <div key={index} className="text-sm">
            <p className="font-medium text-gray-800 leading-tight">{paper.title}</p>
            <p className="text-gray-600 text-xs">
              {paper.year}
              {paper.journal && ` • ${paper.journal}`}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="group hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col relative">
        {/* Coauthor Badge */}
        {hasCoauthoredPapers && (
          <div className="absolute top-3 right-3 z-10">
            <Tooltip content={renderCoauthorTooltip()} position="top" width="w-80">
              <div className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full cursor-help shadow-sm">
                Coauthor
              </div>
            </Tooltip>
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col">
          {/* Centered Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                        ${author.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                    `;
                  }}
                />
              </div>
              {author.isVerified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerifiedBadge />
                </div>
              )}
            </div>
          </div>

          {/* Centered Name */}
          <div className="text-center mb-3 min-h-[3.5rem] flex items-center justify-center">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
              {author.name}
            </h3>
          </div>

          {/* Centered Headline */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed text-center">
            {author.headline}
          </p>

          {/* Details - Line Items - Takes remaining space */}
          <div className="space-y-2 text-xs text-gray-600 mb-4 flex-1">
            {/* Affiliation */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="truncate">{author.affiliation}</span>
            </div>

            {/* Publications */}
            <div className="flex items-center space-x-2">
              <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span>{author.publicationCount} publications</span>
            </div>

            {/* Followers */}
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3 text-indigo-500 flex-shrink-0" />
              <span>{formatNumber(author.followerCount)} followers</span>
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
