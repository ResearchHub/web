import { Avatar } from '@/components/ui/Avatar';
import { ReviewStars } from '../lib/ReviewExtension';
import { useUser } from '@/contexts/UserContext';

interface EditorHeaderProps {
  isReview: boolean;
  rating: number;
  onRatingChange: (rating: number) => void;
  isReadOnly: boolean;
}

export const EditorHeader = ({
  isReview,
  rating,
  onRatingChange,
  isReadOnly,
}: EditorHeaderProps) => {
  const { user } = useUser();
  if (!user) return null;

  // If session is null, show a default header with "User"
  if (!user) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar src={undefined} alt="User" size="sm" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[15px]">
              <span className="font-semibold text-gray-800">You</span>
              <span className="text-gray-600">{isReview ? 'reviewing' : 'commenting'}</span>
            </div>
          </div>
        </div>

        {/* Rating stars for review comments */}
        {isReview && (
          <div className="ml-auto flex items-center">
            <span className="text-sm text-gray-700 mr-2">Overall score:</span>
            <ReviewStars
              rating={rating}
              onRatingChange={onRatingChange}
              isRequired={true}
              isReadOnly={isReadOnly}
              label=""
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <Avatar src={user.authorProfile?.profileImage} alt={user.fullName || 'User'} size="sm" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[15px]">
            <span className="font-semibold text-gray-800">{user.fullName || 'User'}</span>
            <span className="text-gray-600">{isReview ? 'reviewing' : 'commenting'}</span>
          </div>
        </div>
      </div>

      {/* Rating stars for review comments */}
      {isReview && (
        <div className="ml-auto flex items-center">
          <span className="text-sm text-gray-700 mr-2">Overall score:</span>
          <ReviewStars
            rating={rating}
            onRatingChange={onRatingChange}
            isRequired={true}
            isReadOnly={isReadOnly}
            label=""
          />
        </div>
      )}
    </div>
  );
};
