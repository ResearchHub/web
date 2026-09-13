import React from 'react';

/** Placeholder rows for the AI Mode conversation list: a title and a timestamp. */
export const ConversationListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  // One step darker than the other skeletons: the list sits on gray-100.
  <div className="space-y-1 px-1" aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="space-y-1.5 px-3 py-2">
        <div
          className="h-3.5 animate-pulse rounded bg-gray-200"
          style={{ width: `${70 + ((index * 17) % 25)}%` }}
        />
        <div className="h-2.5 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

/** Placeholder transcript: a user bubble on the right, an answer on the left. */
export const ChatTranscriptSkeleton: React.FC = () => (
  <div className="space-y-6" aria-hidden="true">
    <div className="flex justify-end">
      <div className="h-10 w-2/3 animate-pulse rounded-2xl rounded-br-md bg-gray-100" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-11/12 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
    </div>
    <div className="flex justify-end">
      <div className="h-10 w-1/2 animate-pulse rounded-2xl rounded-br-md bg-gray-100" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
    </div>
  </div>
);

/**
 * Placeholder for the AI Mode document: a title and a few sections, with the
 * same left gutter the editor keeps for its block handle, so the real page
 * lands exactly where the bones were.
 */
export const DocumentPaneSkeleton: React.FC = () => (
  <div className="space-y-6 pl-16" aria-hidden="true">
    <div className="h-9 w-3/4 animate-pulse rounded-md bg-gray-100" />
    {[0, 1, 2].map((section) => (
      <div key={section} className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded-md bg-gray-100" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
);
