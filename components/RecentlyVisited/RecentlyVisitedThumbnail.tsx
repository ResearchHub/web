import { Avatar } from '@/components/ui/Avatar';
import { DocumentThumbnail } from '@/components/Funding/dashboard/DocumentThumbnail';
import { cn } from '@/utils/styles';

interface RecentlyVisitedThumbnailProps {
  readonly imageUrl?: string;
  readonly authorImage?: string;
  readonly isPaper: boolean;
}

const TILE = 'flex h-12 w-12 shrink-0 overflow-hidden rounded-[10px]';

/** A small blank first page, standing in for a paper that has no preview image. */
function TitlePageThumbnail() {
  return (
    <span className={cn(TILE, 'items-end justify-center bg-slate-200/70')} aria-hidden="true">
      <span className="flex h-10 w-8 flex-col gap-0.5 rounded-t-sm bg-white px-1 pt-[5px] shadow-[0_1px_2px_rgba(15,23,42,0.12)]">
        <span className="block h-0.5 w-full rounded-full bg-gray-800" />
        <span className="block h-0.5 w-[70%] rounded-full bg-gray-800" />
        <span className="mt-0.5 block h-px w-1/2 bg-gray-400" />
        <span className="mt-0.5 block h-px w-full bg-gray-300" />
        <span className="block h-px w-full bg-gray-300" />
        <span className="block h-px w-[85%] bg-gray-300" />
      </span>
    </span>
  );
}

/**
 * The picture beside a recently visited document: its cover (or a paper's first
 * page), else a drawn title page for papers, else an author's photo, else a file icon.
 */
export function RecentlyVisitedThumbnail({
  imageUrl,
  authorImage,
  isPaper,
}: RecentlyVisitedThumbnailProps) {
  if (imageUrl) return <DocumentThumbnail image={imageUrl} size="lg" />;
  if (isPaper) return <TitlePageThumbnail />;
  if (authorImage) {
    return (
      <span className={cn(TILE, 'items-center justify-center bg-gray-100')}>
        <Avatar src={authorImage} alt="" size={24} disableTooltip className="ring-2 ring-white" />
      </span>
    );
  }
  return <DocumentThumbnail image={null} size="lg" />;
}
