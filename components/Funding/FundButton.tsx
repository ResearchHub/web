'use client';

import type { ReactNode } from 'react';
import { Coins } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { actionButtonProps, type ActionGround } from '@/components/Funding/lib/unavailableAction';
import { cn } from '@/utils/styles';

interface FundButtonProps {
  /** "Fund", or "Add to pool" on an RFP's pool card. */
  children: ReactNode;
  size?: ButtonProps['size'];
  className?: string;
  /** Why it can't be used, e.g. the fundraise has ended: it stays, grayed out, with this on hover. */
  unavailableReason?: string;
  /** What it sits on, for how it grays out. */
  ground?: ActionGround;
  'data-testid'?: string;
}

/** Opens the page's Fund panel: the coins and a label, in the brand blue. */
export function FundButton({
  children,
  size,
  className,
  unavailableReason,
  ground,
  ...props
}: FundButtonProps) {
  const { openFundPanel } = useFundPanel();
  const action = actionButtonProps(openFundPanel, unavailableReason, ground);
  return (
    <Button
      {...props}
      {...action}
      variant="default"
      size={size}
      className={cn('gap-2', className, action.className)}
    >
      <Coins className="h-4 w-4" />
      {children}
    </Button>
  );
}
