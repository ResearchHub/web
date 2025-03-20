import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/pro-light-svg-icons';
import { ClipboardCheck, MessageSquare, Plus } from 'lucide-react';

interface BountyActionsProps {
  isOpen: boolean;
  isCreator: boolean;
  isPeerReviewBounty: boolean;
  onAwardClick: () => void;
  onNavigationClick: (tab: 'reviews' | 'conversation') => void;
  onContributeClick: () => void;
}

export const BountyActions = ({
  isOpen,
  isCreator,
  isPeerReviewBounty,
  onAwardClick,
  onNavigationClick,
  onContributeClick,
}: BountyActionsProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {isCreator ? (
        <>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onAwardClick}
                className="flex items-center gap-2 shadow-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                size="sm"
              >
                <FontAwesomeIcon icon={faTrophy} className="h-4 w-4" />
                Award bounty
              </Button>
            </div>

            <div className="h-6 border-r border-gray-200"></div>

            <div className="flex gap-2">
              {isPeerReviewBounty ? (
                <Button
                  onClick={() => onNavigationClick('reviews')}
                  size="sm"
                  variant="secondary"
                  className="shadow-sm flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Review
                </Button>
              ) : (
                <Button
                  onClick={() => onNavigationClick('conversation')}
                  size="sm"
                  variant="secondary"
                  className="shadow-sm flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  Answer
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={onContributeClick}
                className="flex items-center gap-2 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Contribute
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          {isPeerReviewBounty ? (
            <Button
              variant="secondary"
              onClick={() => onNavigationClick('reviews')}
              size="sm"
              className="shadow-sm flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            >
              <ClipboardCheck className="h-4 w-4" />
              Review
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => onNavigationClick('conversation')}
              size="sm"
              className="shadow-sm flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            >
              <MessageSquare className="h-4 w-4" />
              Answer
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onContributeClick}
            className="flex items-center gap-2 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Contribute
          </Button>
        </div>
      )}
    </div>
  );
};
