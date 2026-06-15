'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { ImageSection } from '@/components/Feed/ImageSection';
import { AuthorList } from '@/components/ui/AuthorList';
import type { ActivityWorkContext } from './lib/activityWorkContext';

interface ActivityWorkPanelProps {
  work: ActivityWorkContext;
  children?: ReactNode;
  footer?: ReactNode;
}

export const ActivityWorkPanel: FC<ActivityWorkPanelProps> = ({ work, children, footer }) => {
  const { title, href, imageUrl, documentType, authors } = work;

  const imageAlt = title || 'Document image';
  const showAuthors = documentType === 'paper' && authors && authors.length > 0;

  return (
    <div>
      {imageUrl && (
        <div className="md:hidden w-full mb-4 -mt-1 overflow-hidden rounded-lg">
          <ImageSection
            imageUrl={imageUrl}
            alt={imageAlt}
            aspectRatio="16/9"
            previewOnClick={false}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:gap-4">
        <div className="hidden md:block flex-shrink-0 w-[160px]">
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-lg w-full min-h-[120px]">
              <ImageSection
                imageUrl={imageUrl}
                alt={imageAlt}
                naturalDimensions
                previewOnClick={false}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-full min-h-[120px] rounded-lg bg-gray-100 text-gray-400"
              aria-hidden
            >
              <FileText size={32} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <Link
            href={href}
            className="text-[15px] font-semibold text-gray-900 hover:text-primary-600 leading-snug line-clamp-2 md:line-clamp-1"
          >
            {title}
          </Link>

          {showAuthors && (
            <AuthorList
              authors={authors.map((author) => ({
                name: author.fullName,
                verified: author.user?.isVerified ?? author.isVerified,
                authorUrl: author.id === 0 ? undefined : author.profileUrl,
              }))}
              size="xs"
              className="text-gray-500 font-normal"
              delimiter=","
              delimiterClassName="ml-0"
              showAbbreviatedInMobile
              hideExpandButton
            />
          )}

          {children}

          {footer && <div className="mt-1">{footer}</div>}
        </div>
      </div>
    </div>
  );
};
