'use client';

import { Button, ButtonProps } from './Button';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export const LoadingButton = ({
  isLoading,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
