'use client';

import { Play } from 'lucide-react';
import type { DetectedUrl } from '@/utils/url';
import { cn } from '@/utils/styles';
import { useLinkPreview } from './hooks/useLinkPreview';

/**
 * A video's still with a play button over it: YouTube's own thumbnail, or
 * the link preview's image for anything else. Dark until an image arrives,
 * and stays dark (play button and all) when none does. Not a control: it
 * sits inside whatever opens the video.
 */
export function VideoThumbnail({
  embed,
  className,
}: {
  readonly embed: DetectedUrl;
  readonly className?: string;
}) {
  const youtubeStill =
    embed.kind === 'youtube' && embed.videoId
      ? `https://img.youtube.com/vi/${embed.videoId}/hqdefault.jpg`
      : null;
  const { data: preview } = useLinkPreview(embed.url, youtubeStill == null);
  const image = youtubeStill ?? preview?.image ?? null;

  return (
    <span className={cn('relative block overflow-hidden rounded-md bg-gray-900', className)}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/15">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70">
          <Play className="ml-0.5 h-3.5 w-3.5 fill-white text-white" aria-hidden="true" />
        </span>
      </span>
    </span>
  );
}
