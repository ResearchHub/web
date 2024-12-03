import { CircleUser } from 'lucide-react';
import { ProfileTooltip } from '../tooltips/ProfileTooltip';
import { User } from '@/types/feed';

interface UserStackProps {
  users: User[];
  limit?: number;
  imageSize?: 'sm' | 'md';
  className?: string;
}

export const UserStack: React.FC<UserStackProps> = ({ 
  users, 
  limit = 3,
  imageSize = 'sm',
  className = ''
}) => {
  const imageSizeClass = imageSize === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  const iconSizeClass = imageSize === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const heightClass = imageSize === 'sm' ? 'h-6' : 'h-8';
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {users.slice(0, limit).map((user) => (
          <div key={user.id} className="relative">
            {user.profileImage ? (
              <img 
                src={user.profileImage}
                alt={user.fullName}
                className={`${imageSizeClass} rounded-full ring-2 ring-white object-cover border border-gray-200`}
              />
            ) : (
              <div className={`${imageSizeClass} rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center border border-gray-200`}>
                <CircleUser className={`${iconSizeClass} text-gray-400`} />
              </div>
            )}
            <ProfileTooltip
              type={user.isOrganization ? 'organization' : 'user'}
              name={user.fullName}
              headline={user.isOrganization ? 'Organization' : 'Researcher'}
            >
              <span className="sr-only">{user.fullName}</span>
            </ProfileTooltip>
          </div>
        ))}
        {users.length > limit && (
          <div className={`relative ${heightClass} min-w-fit px-2 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex items-center ml-1 border border-gray-200 ring-2 ring-white`}>
            +{users.length - limit} Others
          </div>
        )}
      </div>
    </div>
  );
}; 