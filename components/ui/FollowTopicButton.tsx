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
  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Check if this topic is being followed
  const following = optimisticFollowing !== null ? optimisticFollowing : isFollowing(topicId);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent parent click handlers from firing
    e.stopPropagation();

    if (isLoading) return;

    // Optimistically update the UI
    const currentFollowingState = isFollowing(topicId);
    setOptimisticFollowing(!currentFollowingState);

    setIsLoading(true);
    try {
      // This will update the global context state
      await toggleFollow(topicId);
      // Clear optimistic state on success
      setOptimisticFollowing(null);
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Revert optimistic update on error
      setOptimisticFollowing(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (following && isHovered) return 'Unfollow';
    if (following) return 'Following';
    return 'Follow';
  };

  const getButtonStyles = () => {
    if (following && isHovered) {
      return 'text-red-600 border-red-300 hover:border-red-400 hover:bg-red-50';
    }
    if (following) {
      return 'text-gray-600 border-gray-300';
    }
    return 'bg-gray-100 text-gray-900 hover:bg-gray-200';
  };

  return (
    <Button
      onClick={handleFollowToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variant={following ? 'outlined' : 'default'}
      size={size}
      disabled={isLoading}
      className={`rounded-full ${getButtonStyles()} ${className}`}
    >
      {getButtonText()}
    </Button>
  );
}
