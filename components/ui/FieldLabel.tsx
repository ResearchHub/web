import type { ElementType, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface FieldLabelProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** `p` by default; `span` where the label sits inline with other text. */
  readonly as?: ElementType;
}

/** The small uppercase caption above a control or a card section. */
export function FieldLabel({ children, className, as: Tag = 'p' }: FieldLabelProps) {
  return (
    <Tag
      className={cn('text-[11px] font-semibold uppercase tracking-wide text-gray-500', className)}
    >
      {children}
    </Tag>
  );
}
