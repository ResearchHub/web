'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Play, Video } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { DemoVideoUpdateModal } from '@/components/Notification/DemoVideoUpdateModal';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';
import type { PostCardVideo } from '../lib/postCard';

interface VideoPostCardProps {
  data: PostCardVideo;
  showRelatedWork?: boolean;
  showTypeBadge?: boolean;
  className?: string;
}

const VideoBadge: FC = () => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
    <Video size={10} className="text-indigo-600" />
    Video update
  </span>
);

export const VideoPostCard: FC<VideoPostCardProps> = ({
  data,
  showRelatedWork = false,
  showTypeBadge = false,
  className,
}) => {
  const { author, createdDate, snippet, videoUrl, posterUrl, relatedWork } = data;
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const authorLabel = author.fullName || 'Author';
  const dateLabel = formatTimestamp(createdDate, false);

  return (
    <>
      <article
        className={cn(
          'flex h-full flex-col rounded-xl border border-gray-200 bg-white p-3',
          className
        )}
      >
        <header className="flex min-w-0 items-center gap-2.5">
          <Avatar
            src={author.profileImage}
            alt={authorLabel}
            size="sm"
            authorId={author.authorProfileId}
          />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-gray-900">{authorLabel}</span>
            <span className="block text-xs text-gray-500">{dateLabel}</span>
          </div>
          {showTypeBadge && (
            <div className="shrink-0">
              <VideoBadge />
            </div>
          )}
        </header>

        {snippet && (
          <p className="m-0 mt-2 line-clamp-2 text-sm leading-snug text-gray-700">{snippet}</p>
        )}

        <div className="mt-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVideoModalOpen(true);
            }}
            aria-label="Play video update"
            className="group relative block w-full overflow-hidden rounded-lg bg-black"
          >
            <video
              key={videoUrl}
              src={videoUrl}
              poster={posterUrl}
              muted
              playsInline
              preload="metadata"
              className="h-full max-h-[150px] w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-md transition-transform group-hover:scale-105">
                <Play size={20} className="ml-0.5 fill-gray-900 text-gray-900" />
              </span>
            </span>
          </button>
        </div>

        {showRelatedWork && relatedWork && (
          <Link
            href={relatedWork.href}
            className="mt-2 block truncate text-xs text-gray-500 hover:text-gray-700 hover:underline"
            title={relatedWork.title}
          >
            From: <span className="font-medium text-gray-700">{relatedWork.title}</span>
          </Link>
        )}
      </article>

      <DemoVideoUpdateModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={videoUrl}
        title={relatedWork?.title}
        authorName={author.fullName}
      />
    </>
  );
};
