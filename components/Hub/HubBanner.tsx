import { FC, useState } from 'react';
import { Hub } from '@/types/hub';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { authors } from '@/store/authorStore';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { CalendarDays, Users } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

interface HubBannerProps {
  hub: Hub;
}

export const HubBanner: FC<HubBannerProps> = ({ hub }) => {
  // Mock following state for the Join button
  const [following, setFollowing] = useState(false);

  const handleToggle = () => {
    setFollowing((prev) => !prev);
    // TODO: Integrate with actual follow/unfollow logic if needed
  };

  // Mock created date
  const mockCreatedDate = new Date(2023, 10, 15); // Example: Nov 15, 2023

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Cover Image (Placeholder or from Hub data if available) */}
      <div
        className="h-40 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200"
        // style={{ backgroundImage: `url(${hub.coverImageUrl || 'default_cover.jpg'})`, backgroundSize: 'cover' }}
      ></div>

      {/* Content below cover */}
      <div className="max-w-4xl mx-auto px-4 tablet:!px-8">
        <div className="flex items-end -mt-12 mb-4">
          {/* Hub Avatar */}
          <div className="relative mr-4">
            {hub.imageUrl ? (
              <img
                src={hub.imageUrl}
                alt={`${hub.name} Avatar`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-600 border-4 border-white">
                {hub.name.charAt(0)}
              </div>
            )}
          </div>
          {/* Hub Name and Join Button */}
          <div className="flex-grow flex justify-between items-center pb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-bold text-gray-900">{hub.name}</h1>
                {hub.verified && <VerifiedBadge size="md" color="text-amber-500" />}
              </div>
              {/* Optional: Slug or other identifier */}
              {/* <p className="text-sm text-gray-500">h/{hub.slug}</p> */}
            </div>
            <Button
              size="md" // Larger button like Reddit
              variant={following ? 'outlined' : 'default'}
              onClick={handleToggle}
            >
              {following ? 'Joined' : 'Join'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
