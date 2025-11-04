import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from './Button';

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  loadingText: string;
  children: React.ReactNode;
}

export function LoadingButton({ isLoading, loadingText, children, ...props }: LoadingButtonProps) {
  return (
    <Button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
