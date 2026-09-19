'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import type { AuthorProfile } from '@/types/authorProfile';

const MAX_VISIBLE_AUTHORS = 3;
const AUTHOR_AVATAR_SPACING = -14;
const MAX_NAMED_AUTHORS = 2;

function AuthorName({ author }: Readonly<{ author: AuthorProfile }>) {
  const name = author.fullName || 'Unknown';

  if (!author.id) {
    return <span className="font-medium text-gray-900">{name}</span>;
  }

  return (
    <AuthorTooltip authorId={author.id} placement="bottom">
      <Link href={author.profileUrl} className="font-medium text-gray-900 hover:text-primary-600">
        {name}
      </Link>
    </AuthorTooltip>
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
            {index > 0 && <span className="text-gray-500">{separator}</span>}
            <AuthorName author={author} />
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="text-gray-500">
          {` and ${remaining} ${remaining === 1 ? 'other' : 'others'}`}
        </span>
      )}
    </>
  );
}

export function ActivityGroupHeader({
  authors,
  children,
}: Readonly<{
  authors: AuthorProfile[];
  children: ReactNode;
}>) {
  const avatarItems = authors.map((author) => ({
    src: author.profileImage || '',
    alt: author.fullName || 'User',
    authorId: author.id || undefined,
  }));

  return (
    <div className="flex items-start gap-2.5">
      <div className="flex-shrink-0 pt-0.5">
        <AvatarStack
          items={avatarItems}
          size="sm"
          maxItems={MAX_VISIBLE_AUTHORS}
          spacing={AUTHOR_AVATAR_SPACING}
          showLabel={false}
        />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
