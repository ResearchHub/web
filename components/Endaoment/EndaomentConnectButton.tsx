'use client';

import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/Button';
import { useConnectEndaoment } from '@/components/Endaoment/lib/hooks/useConnectEndaoment';

interface EndaomentConnectButtonProps {
  readonly variant?: ButtonProps['variant'];
  readonly size?: ButtonProps['size'];
  readonly className?: string;
}

export function EndaomentConnectButton({
  variant = 'outlined',
  size = 'default',
  className,
}: EndaomentConnectButtonProps) {
  const { connect, isConnecting } = useConnectEndaoment();

  return (
    <Button
      onClick={connect}
      disabled={isConnecting}
      variant={variant}
      size={size}
      className={className}
    >
      {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isConnecting ? 'Connecting...' : 'Connect Endaoment'}
    </Button>
  );
}
