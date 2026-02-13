'use client';

import React from 'react';
import { Authorship } from '@/types/work';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Carousel, CarouselCard } from '@/components/ui/Carousel';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface AuthorsSectionProps {
  authors: Authorship[];
}

const AuthorCard = ({ authorship }: { authorship: Authorship }) => {
  const { authorProfile } = authorship;
  const institution = authorProfile.education?.[0]?.name;

  return (
    <div className="flex items-start gap-3.5">
      <div className="relative flex-shrink-0">
        <AuthorTooltip authorId={authorProfile.id}>
          <Avatar
            src={authorProfile.profileImage}
            alt={authorProfile.fullName}
            size={48}
            authorId={authorProfile.id}
          />
        </AuthorTooltip>
        {authorProfile.isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-px">
            <VerifiedBadge size="xs" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center pt-0.5">
        <h4 className="text-sm font-semibold text-gray-900 truncate">
          {authorProfile.fullName}
        </h4>
        {authorProfile.headline && (
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {authorProfile.headline}
          </p>
        )}
        {institution && (
          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
            {institution}
          </p>
        )}
      </div>
    </div>
  );
};

export function AuthorsSection({ authors }: AuthorsSectionProps) {
  if (!authors || authors.length === 0) return null;

  // Single author: render directly without carousel
  if (authors.length === 1) {
    return (
      <section>
        <SectionHeader title="About the Authors" />
        <div
          className="cursor-pointer"
          onClick={() => {
            if (authors[0].authorProfile.id) {
              navigateToAuthorProfile(authors[0].authorProfile.id);
            }
          }}
        >
          <AuthorCard authorship={authors[0]} />
        </div>
      </section>
    );
  }

  const carouselCards: CarouselCard[] = authors.map((authorship) => ({
    content: <AuthorCard authorship={authorship} />,
    onClick: () => {
      if (authorship.authorProfile.id) {
        navigateToAuthorProfile(authorship.authorProfile.id);
      }
    },
  }));

  return (
    <section>
      <SectionHeader title="About the Authors" />
      <Carousel
        cards={carouselCards}
        cardWidth="w-[220px]"
        cardClassName=""
        gap="gap-4"
      />
    </section>
  );
}
