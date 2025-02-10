import React from 'react';

interface NoteListSkeletonProps {
  count?: number;
}

export const NoteListSkeleton: React.FC<NoteListSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-2 px-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
};
