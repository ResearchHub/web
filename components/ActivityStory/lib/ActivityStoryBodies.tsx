'use client';

import { FC } from 'react';
import { ExternalLink, Linkedin } from 'lucide-react';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import type { DetectedEmbed } from '@/components/Activity/ActivityEmbed';
import type { StoryDetails } from '../types';
import { cn } from '@/utils/styles';

export const ReviewBody: FC<{ details: StoryDetails; dark?: boolean; subtle?: boolean }> = ({
  details,
  dark,
  subtle,
}) => (
  <div
    className={cn(
      'text-sm leading-snug [&_p]:m-0 [&_p+p]:mt-1',
      subtle ? 'line-clamp-3' : 'line-clamp-7',
      dark
        ? subtle
          ? 'text-white/45 [&_*]:!text-white/45'
          : 'text-white/95 [&_*]:!text-white/95'
        : subtle
          ? 'text-gray-400 [&_*]:!text-gray-400'
          : 'text-gray-700'
    )}
  >
    <CommentReadOnly
      content={details.content}
      contentFormat={details.contentFormat}
      maxLength={subtle ? 100 : 220}
      showReadMoreButton={false}
      className="text-sm"
    />
  </div>
);

export const UpdateBody: FC<{
  details: StoryDetails;
  dark?: boolean;
  hideEmbedChip?: boolean;
}> = ({ details, dark, hideEmbedChip }) => (
  <>
    <div
      className={cn(
        'text-sm leading-snug line-clamp-6 [&_p]:m-0 [&_p+p]:mt-1',
        dark ? 'text-white/95 [&_*]:!text-white/95' : 'text-gray-700'
      )}
    >
      <CommentReadOnly
        content={details.content}
        contentFormat={details.contentFormat}
        maxLength={details.embed ? 120 : 220}
        showReadMoreButton={false}
        className="text-sm"
      />
    </div>
    {details.embed && !hideEmbedChip && (
      <div className="mt-3">
        <EmbedChip embed={details.embed} dark={dark} />
      </div>
    )}
  </>
);

/** Inline link chip used inside <UpdateBody> when no full background embed is shown. */
export const EmbedChip: FC<{ embed: DetectedEmbed; dark?: boolean }> = ({ embed, dark }) => {
  let host = '';
  try {
    host = new URL(embed.url).hostname.replace(/^www\./, '');
  } catch {
    host = embed.url;
  }
  const Icon = embed.kind === 'linkedin' ? Linkedin : ExternalLink;
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-md border text-[11px]',
        dark
          ? 'bg-white/10 border-white/20 text-white/90 backdrop-blur-sm'
          : 'bg-gray-50 border-gray-200 text-gray-600'
      )}
    >
      <Icon size={11} className="shrink-0" />
      <span className="truncate">{host}</span>
    </div>
  );
};
