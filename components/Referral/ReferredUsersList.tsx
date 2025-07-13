'use client';

import { Users, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '../ui/AuthorTooltip';
import { ReferredUsersSkeleton } from './ReferredUsersSkeleton';
import { useReferralNetworkDetails } from '@/hooks/useReferral';

const USERS_PER_PAGE = 5;

export function ReferredUsersList() {
  const {
    networkDetails,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToNextPage,
    goToPrevPage,
  } = useReferralNetworkDetails(USERS_PER_PAGE);

  // Transform the network details to the format expected by the component
  const displayUsers = networkDetails.map((user) => ({
    name: user.fullName,
    avatarUrl: user.profileImage,
    totalFunded: user.totalFunded,
    creditsEarned: user.referralBonusEarned,
    dateJoined: new Date(user.signupDate).toLocaleDateString(),
    authorId: user.authorId,
  }));

  // Show skeleton while loading
  if (isLoading) {
    return <ReferredUsersSkeleton />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Your Referred Users</h2>
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading users</h3>
          <p className="text-gray-500 mb-6 px-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="default">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Referred Users</h2>

      {displayUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No referred users yet</h3>
          <p className="text-gray-500 mb-6 px-4">
            Share your referral link to start building your network and earning credits.
          </p>
          <Button
            onClick={() => {
              document.querySelector('main')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            variant="default"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Your Link
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {displayUsers.map((user, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center py-4 gap-3"
              >
                <AuthorTooltip authorId={user.authorId}>
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="md"
                    authorId={user.authorId}
                    className="mr-0 sm:mr-4"
                  />
                </AuthorTooltip>
                <div className="flex-grow min-w-0">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">Joined: {user.dateJoined}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-600">Total Funded</p>
                    <p className="font-semibold text-green-600">
                      ${user.totalFunded.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-600">Credits Earned</p>
                    <p className="font-semibold text-blue-600">
                      ${user.creditsEarned.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              onClick={goToPrevPage}
              disabled={!hasPrevPage}
              variant="outlined"
              size="sm"
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-gray-700 flex items-center gap-2 order-first sm:order-none">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={!hasNextPage}
              variant="outlined"
              size="sm"
              className="w-full sm:w-auto"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
