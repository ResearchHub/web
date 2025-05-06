import { FC, useState } from 'react';
import { Hub } from '@/types/hub';
import { Button } from '@/components/ui/Button';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { authors } from '@/store/authorStore';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Users } from 'lucide-react';

interface HubCardProps {
  hub: Hub;
  onFollowToggle?: (id: number, isFollowing: boolean) => void;
  isFollowing?: boolean;
}

export const HubCard: FC<HubCardProps> = ({ hub, onFollowToggle, isFollowing = false }) => {
  const [following, setFollowing] = useState(isFollowing);

  const editors = (hub.editors || []).map((id) => {
    const editor = authors.find((a) => a.id === id);
    return {
      src: editor?.profileImage || '',
      alt: editor?.fullName || 'Unknown',
      tooltip: editor?.fullName || 'Unknown',
      authorId: editor?.id,
    };
  });

  const handleToggle = () => {
    if (onFollowToggle) {
      onFollowToggle(hub.id, following);
    }
    setFollowing((prev) => !prev);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col h-full hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-2">
        {hub.imageUrl ? (
          <img
            src={hub.imageUrl}
            alt={hub.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600 flex-shrink-0">
            {hub.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-md font-semibold leading-tight">{hub.name}</h3>
            {hub.id === 103 && (
              <VerifiedBadge size="sm" color="text-amber-500" className="ml-1 flex-shrink-0" />
            )}
          </div>
          {hub.headline && <p className="text-sm text-gray-600 mt-0.5">{hub.headline}</p>}
        </div>
      </div>

      <div className="flex-grow mt-2">
        {hub.followersCount !== undefined && (
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <p className="text-sm text-gray-600">{hub.followersCount.toLocaleString()} followers</p>
          </div>
        )}

        {editors.length > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">Editors:</p>
            <AvatarStack items={editors} size="sm" />
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant={following ? 'outlined' : 'default'}
        className="mt-4 w-full"
        onClick={handleToggle}
      >
        {following ? 'Joined' : 'Join'}
      </Button>
    </div>
  );
};
