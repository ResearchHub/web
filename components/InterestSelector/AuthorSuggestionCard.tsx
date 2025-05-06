import React from 'react';
// import { SuggestedAuthor } from './InterestSelector'; // Removed import
import { AuthorSuggestion } from '@/store/authorStore'; // Import type from store

interface AuthorSuggestionCardProps {
  author: AuthorSuggestion; // Use type from store
  isFollowing: boolean;
  onFollowToggle: (id: number, isFollowing: boolean) => void;
}

export const AuthorSuggestionCard: React.FC<AuthorSuggestionCardProps> = ({
  author,
  isFollowing,
  onFollowToggle,
}) => {
  const handleFollowClick = () => {
    onFollowToggle(author.id, isFollowing);
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white flex flex-col items-center text-center h-full">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden flex-shrink-0">
        {author.profileImage ? (
          <img
            src={author.profileImage}
            alt={author.fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300"></div> // Placeholder if no image
        )}
      </div>
      {/* Name */}
      <div className="font-semibold text-lg mb-1 truncate w-full">{author.fullName}</div>
      {/* Headline & Institution */}
      <div className="text-base text-gray-600 mb-1 line-clamp-2 min-h-[2.5rem]">
        {author.headline || 'Author'}
      </div>
      {author.institution && (
        <div className="text-sm text-gray-500 mb-3 truncate w-full">{author.institution}</div>
      )}
      {/* Stats */}
      <div className="text-sm text-gray-500 mb-1">H-Index: {author.hIndex ?? 'N/A'}</div>
      <div className="text-sm text-gray-500 mb-1">Works: {author.worksCount ?? 'N/A'}</div>
      <div className="text-sm text-gray-500 mb-3">Followers: {author.followersCount ?? 0}</div>

      {/* Spacer to push button down */}
      <div className="flex-grow"></div>

      {/* Suggestion Reason */}
      {author.suggestionReason && (
        <div className="text-xs text-gray-500 italic mt-2 mb-2">{author.suggestionReason}</div>
      )}

      {/* Follow Button */}
      <button
        onClick={handleFollowClick}
        className={`mt-auto px-4 py-2 rounded text-base font-medium w-full ${
          isFollowing
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};
