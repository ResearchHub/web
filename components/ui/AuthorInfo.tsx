import { Users } from 'lucide-react';

interface AuthorInfoProps {
  fullName: string;
  email?: string;
  image?: string;
  isCurrentUser?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    container: 'h-8 w-8',
    icon: 'h-4 w-4',
    text: 'text-xs',
    email: 'text-xs',
  },
  md: {
    container: 'h-10 w-10',
    icon: 'h-5 w-5',
    text: 'text-sm',
    email: 'text-xs',
  },
  lg: {
    container: 'h-12 w-12',
    icon: 'h-6 w-6',
    text: 'text-base',
    email: 'text-sm',
  },
};

export function AuthorInfo({
  email,
  fullName,
  image,
  isCurrentUser,
  size = 'md',
}: AuthorInfoProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className="flex items-center gap-3 max-w-full truncate">
      <div className="flex-shrink-0">
        {image ? (
          <div className={`${sizeClass.container} rounded-full overflow-hidden`}>
            <img src={image} alt={fullName} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div
            className={`${sizeClass.container} rounded-full bg-gray-200 flex items-center justify-center`}
          >
            <Users className={`${sizeClass.icon} text-gray-500`} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${sizeClass.text} font-medium text-gray-900 truncate`}>
          {fullName}
          {isCurrentUser && <span className="text-gray-500 ml-1">(you)</span>}
        </p>
        {email && <p className={`${sizeClass.email} text-gray-600 truncate`}>{email}</p>}
      </div>
    </div>
  );
}
