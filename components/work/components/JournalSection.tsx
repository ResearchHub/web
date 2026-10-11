'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icons/Icon';
import { Badge } from '@/components/ui/Badge';
import { getSourceLogo, getPreprintDisplayName, isPreprintServer } from '@/utils/preprintUtil';
import type { Journal } from '@/types/journal';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

interface JournalSectionProps {
  journal: Journal;
}

export const JournalSection = ({ journal }: JournalSectionProps) => {
  if (!journal || !journal.name) return null;

  const logo = getSourceLogo(journal.slug);
  const isRHJournal = logo === 'rhJournal2';
  const isPreprint = isPreprintServer(journal.slug);
  const displayName = logo ? getPreprintDisplayName(journal.slug) : journal.name;
  const sectionTitle = isPreprint ? 'Preprint Server' : 'Journal';

  const badge = (
    <Badge
      variant="default"
      className={`text-xs font-medium bg-white border border-gray-200 px-2 py-1 h-[26px] ${isRHJournal ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
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
  );

  return (
    <section>
      <SidebarHeader title={sectionTitle} className="mb-3" />
      {isRHJournal ? (
        <Link href="/journal" className="inline-block">
          {badge}
        </Link>
      ) : (
        <span className="inline-block">{badge}</span>
      )}
    </section>
  );
};
