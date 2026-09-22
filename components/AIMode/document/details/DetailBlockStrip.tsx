'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import { usePublishingController } from '@/components/Notebook/PublishingForm';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { useFittingCount } from '@/hooks/useFittingCount';
import { AllDetailsBlock, ALL_DETAILS_BLOCK_WIDTH } from './AllDetailsBlock';
import { DetailBlock, DETAIL_BLOCK_MIN_WIDTH } from './DetailBlock';
import { detailBlocksFor } from './detailBlocks';

const GAP = 8;

interface DetailBlockStripProps {
  /** The full details form is showing instead of the document. */
  readonly detailsOpen: boolean;
  readonly onToggleDetails: () => void;
  /** Controls kept at the strip's end, after the blocks. */
  readonly trailing?: ReactNode;
  /** Width `trailing` takes, so the count of blocks that fit allows for it. */
  readonly trailingWidth?: number;
}

/**
 * The publishing details as a row of blocks above the document, as many as
 * the pane is wide enough for. Blocks keep a fixed order; the ones past the
 * room fold into the last block, which opens the full form and says how
 * many it holds. One editor is open at a time.
 */
export function DetailBlockStrip({
  detailsOpen,
  onToggleDetails,
  trailing,
  trailingWidth = 0,
}: DetailBlockStripProps) {
  const { note, articleType } = usePublishingController();
  const values = useWatch<PublishingFormData>() as PublishingFormData;
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);

  const blocks = useMemo(
    () => detailBlocksFor(articleType).filter((block) => !block.hiddenWhen?.(values)),
    [articleType, values]
  );
  const summaries = useMemo(() => blocks.map((block) => block.summarize(values)), [blocks, values]);
  const done = summaries.filter((value) => value != null).length;

  const { ref, count: visibleCount } = useFittingCount<HTMLDivElement>({
    itemCount: blocks.length,
    minItemWidth: DETAIL_BLOCK_MIN_WIDTH,
    gap: GAP,
    reservedWidth: ALL_DETAILS_BLOCK_WIDTH + GAP + (trailingWidth > 0 ? trailingWidth + GAP : 0),
  });

  // A field is mounted once: the full form and a block's editor never show
  // together, so opening either puts the other away.
  const openDetails = () => {
    setOpenBlockId(null);
    onToggleDetails();
  };
  const setBlockOpen = (id: string, open: boolean) => {
    if (open && detailsOpen) onToggleDetails();
    setOpenBlockId(open ? id : null);
  };

  return (
    <div
      ref={ref}
      style={{ gap: GAP }}
      className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-3"
    >
      {note != null &&
        blocks
          .slice(0, visibleCount)
          .map((block, index) => (
            <DetailBlock
              key={block.id}
              config={block}
              noteId={note.id}
              value={summaries[index]}
              open={openBlockId === block.id}
              onOpenChange={(open) => setBlockOpen(block.id, open)}
            />
          ))}
      {note != null && (
        <AllDetailsBlock
          done={done}
          total={blocks.length}
          hiddenCount={Math.max(0, blocks.length - visibleCount)}
          active={detailsOpen}
          onClick={openDetails}
        />
      )}
      {trailing}
    </div>
  );
}
