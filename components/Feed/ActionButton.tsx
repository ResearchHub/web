import { FC } from 'react';
import { Button } from '@/components/ui/Button';

interface ActionButtonProps {
  icon: any;
  count?: number;
  label: string;
  tooltip?: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost';
  className?: string;
  active?: boolean;
  showLabel?: boolean;
}

/**
 * ActionButton is a reusable component for rendering action buttons in feed items
 * It displays an icon with an optional count and tooltip
 */
export const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  count,
  label,
  tooltip,
  onClick,
  variant = 'ghost',
  className,
  active = false,
  showLabel = false,
}) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    className={`flex items-center space-x-1.5 ${className || 'text-gray-700 hover:text-gray-900'} ${
      active ? 'text-primary-600 hover:text-primary-700' : ''
    }`}
    tooltip={tooltip}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-800'}`} strokeWidth={2} />
    {count !== undefined && count > 0 && (
      <span className={`text-xs font-medium ${active ? 'text-primary-600' : ''}`}>{count}</span>
    )}
    {showLabel ? (
      <span className="text-xs">{label}</span>
    ) : (
      <span className="sr-only">{label}</span>
    )}
  </Button>
);
