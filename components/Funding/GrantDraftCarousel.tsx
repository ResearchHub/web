'use client';

import { FC } from 'react';
import type { Note } from '@/types/note';
import { cn } from '@/utils/styles';
import { Carousel } from '@/components/ui/Carousel';
import { DraftGrantCard } from './DraftGrantCard';

interface GrantDraftCarouselProps {
  drafts: Note[];
  className?: string;
  onContinueEditing: (noteId: number) => void;
  onDelete: (noteId: number) => void;
}

export const GrantDraftCarousel: FC<GrantDraftCarouselProps> = ({
  drafts,
  className,
  onContinueEditing,
  onDelete,
}) => {
  if (drafts.length === 0) return null;

  return (
    <section className={cn('pt-4', className)}>
      <Carousel>
        {drafts.map((note) => (
          <div key={note.id} className="flex-shrink-0 w-[260px] sm:w-[280px]">
            <DraftGrantCard
              note={note}
              onContinueEditing={() => onContinueEditing(note.id)}
              onDelete={() => onDelete(note.id)}
            />
          </div>
        ))}
      </Carousel>
    </section>
  );
};
