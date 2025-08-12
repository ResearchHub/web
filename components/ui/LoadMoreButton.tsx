import { Button } from './Button';
import { ChevronDown, RefreshCw } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

export function LoadMoreButton({
  onClick,
  isLoading = false,
  label = 'Load More',
  className,
}: LoadMoreButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      variant="outlined"
      className={`flex items-center space-x-2 ${className || ''}`}
    >
      {isLoading ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
