'use client';

import Link from 'next/link';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import type { AuthorProfile } from '@/types/authorProfile';
import { isVerifiedAuthor } from '../lib/activityDisplay.utils';

const MAX_NAMED_AUTHORS = 2;

function AuthorName({ author }: Readonly<{ author: AuthorProfile }>) {
  const name = author.fullName || 'Unknown';

  return (
    <span className="inline-flex items-center">
      {author.id ? (
        <AuthorTooltip authorId={author.id} placement="bottom">
          <Link
            href={author.profileUrl}
            className="font-semibold text-gray-900 hover:text-primary-600"
          >
            {name}
          </Link>
        </AuthorTooltip>
      ) : (
        <span className="font-semibold text-gray-900">{name}</span>
      )}
      {isVerifiedAuthor(author) && (
        <VerifiedBadge size="sm" showTooltip className="ml-1 shrink-0" />
      )}
    </span>
  );
}

export function ActivityAuthorSummary({ authors }: Readonly<{ authors: AuthorProfile[] }>) {
  const named = authors.slice(0, MAX_NAMED_AUTHORS);
  const remaining = authors.length - named.length;

  return (
    <>
      {named.map((author, index) => {
        const isLastNamed = index === named.length - 1;
        const separator = isLastNamed && remaining === 0 ? ' and ' : ', ';

        return (
          <span key={`${author.id}-${index}`}>
            {index > 0 && <span className="text-gray-900">{separator}</span>}
            <AuthorName author={author} />
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="text-gray-900">
          {` and ${remaining} ${remaining === 1 ? 'other' : 'others'}`}
        </span>
      )}
    </>
  );
}
