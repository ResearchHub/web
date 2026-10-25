'use client';

import katex from 'katex';
import { cn } from '@/utils/styles';

/** Same pattern TipTap's Mathematics migration uses for `$...$` text. */
export const INLINE_MATH_REGEX = /\$(?!\d+\$)(.+?)\$(?!\d)/g;

export const BLOCK_MATH_REGEX = /^\$\$([\s\S]+?)\$\$/;

interface KatexMathProps {
  latex: string;
  display?: boolean;
  className?: string;
}

/**
 * Renders a LaTeX string with KaTeX. Falls back to the raw source when
 * KaTeX cannot parse it so comments stay readable instead of blank.
 */
export function KatexMath({ latex, display = false, className }: KatexMathProps) {
  try {
    const html = katex.renderToString(latex, {
      displayMode: display,
      throwOnError: false,
    });
    return (
      <span
        className={cn(
          'tiptap-math',
          display
            ? 'tiptap-block-math my-3 block overflow-x-auto text-center'
            : 'tiptap-inline-math',
          className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return (
      <code
        className={cn(
          'tiptap-math-error bg-gray-100 px-1 rounded text-sm',
          display && 'my-3 block overflow-x-auto',
          className
        )}
      >
        {latex}
      </code>
    );
  }
}
