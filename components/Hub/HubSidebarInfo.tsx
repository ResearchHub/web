import { FC } from 'react';
import { Hub } from '@/types/hub';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { authors } from '@/store/authorStore';
import { CalendarDays, Users } from 'lucide-react';
import { format } from 'date-fns';

interface HubSidebarInfoProps {
  hub: Hub;
}

export const HubSidebarInfo: FC<HubSidebarInfoProps> = ({ hub }) => {
  const editors = (hub.editors || []).map((id) => {
    const editor = authors.find((a) => a.id === id);
    return {
      src: editor?.profileImage || '',
      alt: editor?.fullName || 'Unknown',
      tooltip: editor?.fullName || 'Unknown',
      authorId: editor?.id,
    };
  });

  // Mock created date
  const mockCreatedDate = new Date(2023, 10, 15); // Example: Nov 15, 2023

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">About Community</h2>
      </div>
      <div className="p-4 space-y-4">
        {hub.description && <p className="text-sm text-gray-700">{hub.description}</p>}

        <div className="flex items-center text-sm text-gray-600">
          <CalendarDays size={16} className="mr-2 flex-shrink-0" />
          <span>Created {format(mockCreatedDate, 'MMM d, yyyy')}</span>
        </div>

        {hub.followersCount !== undefined && (
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-2 flex-shrink-0" />
            <span>{hub.followersCount.toLocaleString()} Members</span>
          </div>
        )}

        {editors.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-2">Editors</h3>
            <AvatarStack items={editors} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};
