export type PillSize = 'xs' | 'sm' | 'md' | 'lg';

export const pillSizeClasses: Record<PillSize, string> = {
  xs: 'gap-1 px-2.5 py-1 text-xs',
  sm: 'gap-1.5 px-3 py-1.5 text-sm',
  md: 'gap-1.5 px-4 py-2 text-sm',
  lg: 'gap-2 px-5 py-2.5 text-base',
};
