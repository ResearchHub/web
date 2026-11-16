import type { ComponentProps } from 'react';
import { cn } from '@/utils/styles';
import { PixelBackdrop } from '@/app/endowment/components/PixelBackdrop';

const EDGE_MASKS = {
  bottom: '[mask-image:linear-gradient(to_bottom,#000_55%,transparent)]',
  both: '[mask-image:linear-gradient(to_bottom,transparent,#000_25%,#000_75%,transparent)]',
};

/** `PixelBackdrop`, faded out at the section's edges so it never meets a seam. */
export function FadedPixels({
  side,
  fade = 'both',
}: Readonly<{
  side: ComponentProps<typeof PixelBackdrop>['side'];
  fade?: keyof typeof EDGE_MASKS;
}>) {
  return (
    <div className={cn('pointer-events-none absolute inset-0', EDGE_MASKS[fade])} aria-hidden>
      <PixelBackdrop side={side} />
    </div>
  );
}
