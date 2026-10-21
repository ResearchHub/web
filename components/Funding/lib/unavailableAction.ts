/** What a grayed-out button sits on: the white page, or the navy funding card. */
export type ActionGround = 'light' | 'navy';

/**
 * A grayed-out button's look. Each sets its own hover, so the variant's
 * hover doesn't light it back up.
 */
const UNAVAILABLE_CLASS: Record<ActionGround, string> = {
  light:
    'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 shadow-none hover:bg-gray-100',
  navy: 'cursor-not-allowed border-transparent bg-white/10 text-white/45 shadow-none hover:bg-white/10',
};

export interface ActionButtonProps {
  onClick?: () => void;
  'aria-disabled'?: boolean;
  title?: string;
  className?: string;
}

/**
 * A Fund or Apply button's props: its click as usual or, with a reason it
 * can't be used, the button grayed out in its place with the reason on hover.
 * It is aria-disabled rather than disabled, which would drop it from the
 * keyboard's order and, as Button styles it, ignore the pointer and so its
 * title. The caller merges `className` into its own.
 */
export function actionButtonProps(
  onClick: () => void,
  unavailableReason: string | undefined,
  ground: ActionGround = 'light'
): ActionButtonProps {
  if (!unavailableReason) return { onClick };
  return {
    'aria-disabled': true,
    title: unavailableReason,
    className: UNAVAILABLE_CLASS[ground],
  };
}

/** Why an RFP's Apply is grayed out, or nothing while it takes proposals. */
export function getApplyUnavailableReason({
  canApply,
  isPending,
}: {
  canApply: boolean;
  isPending: boolean;
}): string | undefined {
  if (canApply) return undefined;
  return isPending
    ? 'This RFP takes proposals once it is approved'
    : 'This RFP is no longer taking proposals';
}

/** Why an RFP's Fund or Add to pool is grayed out, or nothing while its pool takes money. */
export function getPoolUnavailableReason({
  isPoolOpen,
  isPending,
}: {
  isPoolOpen: boolean;
  isPending: boolean;
}): string | undefined {
  if (isPoolOpen) return undefined;
  return isPending
    ? 'This pool takes contributions once the RFP is approved'
    : 'This pool is no longer taking contributions';
}
