'use client';

import React from 'react';
import { useUserDetailsForModerator } from '@/hooks/useAuthor';
import { formatTimestamp } from '@/utils/date';

export function ModerationSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 text-sm w-full md:max-w-[300px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="font-medium whitespace-nowrap bg-gray-200 rounded h-4 w-24 animate-pulse" />
              <span className="bg-gray-200 rounded h-4 w-32 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="font-medium whitespace-nowrap bg-gray-200 rounded h-4 w-28 animate-pulse" />
              <span className="bg-gray-200 rounded h-4 w-36 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type ModerationProps = {
  userId: string;
};

export default function Moderation({ userId }: ModerationProps) {
  const [{ userDetails, isLoading }] = useUserDetailsForModerator(userId);

  if (isLoading) {
    return <ModerationSkeleton />;
  }

  if (!userDetails) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 text-sm w-full md:max-w-[300px]">
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Email:</span>
            <span className="truncate max-w-[200px]">{userDetails.email || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">User ID:</span>
            <span>{userDetails.id || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Likely spammer?</span>
            <span>{userDetails.isProbableSpammer ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Suspended?</span>
            <span>{userDetails.isSuspended ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Sift risk score:</span>
            <span>{userDetails.riskScore || 'N/A'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium whitespace-nowrap">Verified name:</span>
            <span className="break-words line-clamp-1">
              {userDetails.verification
                ? `${userDetails.verification.firstName} ${userDetails.verification.lastName}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium whitespace-nowrap">Verification via:</span>
            <span>
              {userDetails.verification
                ? `${userDetails.verification.verifiedVia} on ${formatTimestamp(
                    userDetails.verification.createdDate
                  )}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium whitespace-nowrap">Verification ID:</span>
            <span
              className="break-words line-clamp-1"
              title={`Verification ID: ${userDetails.verification?.externalId || 'N/A'}`}
            >
              {userDetails.verification?.externalId || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Verified status:</span>
            <span>{userDetails.verification?.status || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
