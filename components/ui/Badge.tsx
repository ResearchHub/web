import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/styles';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 border border-gray-200',
        primary: 'bg-primary-100 text-primary-800 border border-primary-200',
        success: 'bg-green-100 text-green-800 border border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        error: 'bg-red-100 text-red-800 border border-red-200',
        orange: 'bg-orange-50 text-orange-800 border border-orange-200',
        bounty: 'bg-gray-100 text-gray-700 border border-gray-200',
      },
      size: {
        default: 'text-xs',
        sm: 'text-[10px] px-1.5 py-0.5',
        lg: 'text-sm px-2.5 py-0.5',
        xs: 'text-[9px] px-1.5 py-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
}
