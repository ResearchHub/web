import { BountySolution } from '@/types/bounty';
import { ContentType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { RSCBadge } from '@/components/ui/CurrencyBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faTrophy } from '@fortawesome/pro-light-svg-icons';
import { ID } from '@/types/root';
import { ChevronUp, ChevronDown, MessageCircle, PlusIcon, Reply } from 'lucide-react';
import { useState } from 'react';
import { Tooltip } from '../ui/Tooltip';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useComment } from '@/hooks/useComment';
import { useAuth } from '@/contexts/AuthContext';

interface BountySolutionsProps {
  solutions: BountySolution[];
  isPeerReviewBounty: boolean;
  totalAwardedAmount: number;
  onViewSolution: (solutionId: ID, authorName: string, awardedAmount?: string) => void;
}

export const BountySolutions = ({
  solutions,
  isPeerReviewBounty,
  totalAwardedAmount,
  onViewSolution,
}: BountySolutionsProps) => {
  const [showSolutions, setShowSolutions] = useState(false);

  if (!solutions || solutions.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Button
        variant="outlined"
        size="sm"
        onClick={() => setShowSolutions(!showSolutions)}
        className={`flex items-center gap-1.5 ${
          showSolutions ? 'text-indigo-700' : 'hover:bg-gray-50'
        }`}
      >
        {showSolutions ? (
          <MessageCircle className="h-4 w-4 text-indigo-600" />
        ) : (
          <MessageCircle className="h-4 w-4 text-indigo-500" />
        )}
        <span className="font-medium">
          {isPeerReviewBounty ? 'Reviews' : 'Answers'} ({solutions.length})
        </span>
        {showSolutions ? (
          <ChevronUp className="h-3.5 w-3.5 ml-1" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 ml-1" />
        )}
      </Button>

      {/* Add gray divider line spanning the container */}
      {showSolutions && <div className="w-full h-px bg-gray-200 mt-3"></div>}

      {showSolutions && (
        <div className="mt-4 pt-2 animate-fadeIn w-full">
          <h4 className="text-base font-medium text-gray-900 mb-4">
            {isPeerReviewBounty ? 'Reviews' : 'Answers'}
          </h4>
          <div className="rounded-lg border border-gray-200 overflow-hidden w-full">
            {solutions.map((solution, index) => {
              const hasAward = !!solution.awardedAmount;
              const isLast = index === solutions.length - 1;
              return (
                <div
                  key={solution.id}
                  className={`flex items-center justify-between p-4 bg-white
                  ${!isLast ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors duration-150`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={solution.createdBy.authorProfile?.profileImage || ''}
                      alt={solution.createdBy.authorProfile?.fullName || 'User'}
                      size="sm"
                      className={hasAward ? 'ring-2 ring-gray-300 ring-offset-1' : ''}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900">
                          {solution.createdBy.authorProfile?.fullName || 'User'}
                        </span>
                        {hasAward && solution.awardedAmount && (
                          <div className="flex items-center ml-2">
                            {/* lets update this to show the awarded amount in a tooltip */}
                            <PlusIcon className="h-3 w-3 text-orange-500" />
                            <CurrencyBadge
                              amount={parseFloat(solution.awardedAmount)}
                              variant="inline"
                              className="ml-0.5 p-0"
                              size="sm"
                              showIcon={false}
                              showText={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        onViewSolution(
                          solution.objectId,
                          solution.createdBy.authorProfile?.fullName || 'User',
                          solution.awardedAmount
                        )
                      }
                      className="flex items-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total awarded amount */}
          {totalAwardedAmount > 0 && (
            <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200 w-full">
              <div className="flex justify-end items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Total awarded:</span>
                <CurrencyBadge
                  amount={totalAwardedAmount}
                  size="sm"
                  variant="inline"
                  inverted={true}
                  className="flex items-center"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
