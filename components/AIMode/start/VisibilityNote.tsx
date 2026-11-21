import { Lock } from 'lucide-react';
import { cn } from '@/utils/styles';

interface VisibilityNoteProps {
  readonly className?: string;
}

/**
 * For a researcher, under the composer: one quiet line on who will see the
 * proposal, decided when it is submitted.
 */
export function VisibilityNote({ className }: VisibilityNoteProps) {
  return (
    <p className={cn('flex items-center gap-1.5 pl-1 text-[13px] text-gray-500', className)}>
      <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      You choose who sees it when you submit: public, or only the funder.
    </p>
  );
}
