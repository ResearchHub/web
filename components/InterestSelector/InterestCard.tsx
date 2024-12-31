import { BadgeCheck, Check } from 'lucide-react';
import { Interest } from '@/store/interestStore';

interface InterestCardProps {
  interest: Interest;
  selected: boolean;
  onSelect: () => void;
}

export function InterestCard({ interest, selected, onSelect }: InterestCardProps) {
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
      onClick={onSelect}
      className={`p-4 rounded-md border transition-all duration-200 text-left w-full relative
        ${selected 
          ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
          : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-center gap-3">
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center
            ${getInitialBgColor(interest.type)}`}
        >
          <span className={`text-xl font-medium ${getInitialTextColor(interest.type)}`}>
            {interest.name.charAt(0)}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-medium">{interest.name}</h3>
            {interest.verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            )}
          </div>
          {interest.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {interest.description}
            </p>
          )}
          {interest.followers && (
            <p className="text-sm text-gray-500 mt-1">
              {interest.followers.toLocaleString()} followers
            </p>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      <div className="absolute top-2 right-2">
        <div className={`p-1 rounded-full ${selected ? 'bg-primary-600' : 'border border-gray-200'}`}>
          <Check className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-400'}`} />
        </div>
      </div>
    </button>
  );
} 