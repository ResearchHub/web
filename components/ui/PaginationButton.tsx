'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function PaginationButton({ label, onClick, disabled, isLoading }: PaginationButtonProps) {
  return (
    <Button variant="outlined" size="sm" className="gap-2" onClick={onClick} disabled={disabled}>
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      </span>
      {label}
      <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
    </Button>
  );
}
