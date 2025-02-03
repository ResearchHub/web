import { Interest } from './InterestSelector';
import { HubService } from '@/services/hub.service';
import { AuthorService } from '@/services/author.service';
import { useState, useEffect } from 'react';

interface InterestCardProps {
  interest: Interest;
  isFollowing: boolean;
  onFollowToggle: (interestId: number, isFollowing: boolean) => void;
}

export function InterestCard({
  interest,
  isFollowing: initialIsFollowing,
  onFollowToggle,
}: InterestCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleClick = async () => {
    if (isLoading || typeof interest.id !== 'number') return;

    setIsLoading(true);
    try {
      if (interest.type === 'journal' || interest.type === 'topic') {
        if (isFollowing) {
          await HubService.unfollowHub(interest.id);
        } else {
          await HubService.followHub(interest.id);
        }
      } else if (interest.type === 'person') {
        if (isFollowing) {
          await AuthorService.unfollowAuthor(interest.id);
        } else {
          await AuthorService.followAuthor(interest.id);
        }
      }
      setIsFollowing(!isFollowing);
      onFollowToggle(interest.id, isFollowing);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialBgColor = (type: string) => {
    switch (type) {
      case 'journal':
        return 'bg-blue-100';
      case 'person':
        return 'bg-green-100';
      case 'topic':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getInitialTextColor = (type: string) => {
    switch (type) {
      case 'journal':
        return 'text-blue-700';
      case 'person':
        return 'text-green-700';
      case 'topic':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left w-full relative
        ${isFollowing ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
      disabled={isLoading}
    >
      <div className="flex items-center gap-3">
        {interest.imageUrl ? (
          <img
            src={interest.imageUrl}
            alt={interest.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center
              ${getInitialBgColor(interest.type)}`}
          >
            <span className={`text-xl font-medium ${getInitialTextColor(interest.type)}`}>
              {interest.name.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-medium">{interest.name}</h3>
          </div>
          {interest.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{interest.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
