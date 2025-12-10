'use client';

import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icons/Icon';
import { Badge } from '@/components/ui/Badge';
import { getSourceLogo, getPreprintDisplayName } from '@/utils/preprintUtil';
import type { Journal } from '@/types/journal';

interface JournalSectionProps {
  journal: Journal;
}

export const JournalSection = ({ journal }: JournalSectionProps) => {
  if (!journal || !journal.name) return null;

  const logo = getSourceLogo(journal.slug);
  const isRHJournal = logo === 'rhJournal2';
  // Use formatted display name for preprint servers (e.g., "arxiv" -> "arXiv")
  const displayName = logo ? getPreprintDisplayName(journal.slug) : journal.name;
  const href = isRHJournal ? '/journal' : `/topic/${journal.slug}`;

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Journal</h2>
      </div>
      <Link href={href} className="inline-block">
        <Badge
          variant="default"
          className="text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer px-2 py-1 h-[26px]"
        >
          {isRHJournal ? (
            <>
              <Icon name="rhJournal2" size={14} className="mr-2" />
              <span className="text-gray-800">RH Journal</span>
            </>
          ) : logo ? (
            <Image
              src={logo}
              alt={journal.name}
              width={50}
              height={14}
              className="object-contain"
              style={{ maxHeight: '14px' }}
            />
          ) : journal.imageUrl ? (
            <Image
              src={journal.imageUrl}
              alt={journal.name}
              width={50}
              height={14}
              className="object-contain"
              style={{ maxHeight: '14px' }}
            />
          ) : (
            <span className="text-gray-800">{displayName}</span>
          )}
        </Badge>
      </Link>
    </section>
  );
};
