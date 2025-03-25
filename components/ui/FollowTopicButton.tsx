'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { HubService } from '@/services/hub.service';
import { useFollowContext } from '@/contexts/FollowContext';

interface FollowTopicButtonProps {
  topicId: number;
  size?: 'sm' | 'default';
  className?: string;
}

export function FollowTopicButton({
  topicId,
  size = 'sm',
  className = '',
}: FollowTopicButtonProps) {
  const { isFollowing, toggleFollow } = useFollowContext();
  const [isLoading, setIsLoading] = useState(false);

  // Check if this topic is being followed
  const following = isFollowing(topicId);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent parent click handlers from firing
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      // This will update the global context state
      await toggleFollow(topicId);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollowToggle}
      variant={following ? 'outlined' : 'default'}
      size={size}
      disabled={isLoading}
      className={`rounded-full ${
        following
          ? 'text-gray-600 border-gray-300 hover:border-gray-400'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      } ${className}`}
    >
      {isLoading ? '...' : following ? 'Following' : 'Follow'}
    </Button>
  );
}
