'use client';

import { AuthorList } from '@/components/ui/AuthorList';
import { Work } from '@/types/work';

export function WorkHeaderSubtitle({ work }: { work: Work }) {
  const authors = work.authors.map((a) => ({
    name: a.authorProfile.fullName,
    verified: a.authorProfile.user?.isVerified,
    profileUrl: `/author/${a.authorProfile.id}`,
    authorUrl: a.authorProfile.user ? `/author/${a.authorProfile.id}` : undefined,
  }));

  return (
    <div className="flex flex-col gap-2">
      {authors.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-base text-gray-500">By</span>
          <AuthorList
            authors={authors}
            size="base"
            className="text-gray-600 font-medium"
            delimiterClassName="text-gray-400"
            delimiter="·"
            showAbbreviatedInMobile
            mobileExpandable
          />
          {work.type === 'preprint' && (
            <span className="font-medium text-xs px-2 py-0.5 rounded-md text-yellow-700 bg-yellow-100">
              Preprint
            </span>
          )}
        </div>
      )}
      {work.publishedDate && (
        <span className="text-sm text-gray-500">
          {new Date(work.publishedDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      )}
    </div>
  );
}
