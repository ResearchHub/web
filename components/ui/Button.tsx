import { ButtonHTMLAttributes, forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Popover } from '@headlessui/react';
import { cn } from '@/utils/styles';
import { PlayCircle, Plus } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        secondary: 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200 focus-visible:ring-indigo-500',
        outlined: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100 text-gray-700',
        link: 'p-0 h-auto text-primary-600 underline-offset-4 hover:underline focus-visible:ring-0 !px-0 !py-0',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        researchcoin: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
        'start-task': 'bg-indigo-600 text-indigo-100 hover:bg-indigo-200 focus-visible:ring-indigo-500',
        contribute: 'bg-white bg-orange-100 text-orange-600 border border-orange-100 hover:bg-orange-200 hover:border-orange-200',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
        metric: 'h-9 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltip?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, tooltip, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const renderContent = () => {
      if (variant === 'start-task') {
        return (
          <div className="flex items-center gap-2">
            <PlayCircle size={16} />
            {children}
          </div>
        );
      }
      
      if (variant === 'contribute') {
        return (
          <div className="flex items-center gap-2">
            <Plus size={16} />
            {children}
          </div>
        );
      }

      return children;
    };

    if (tooltip) {
      return (
        <Popover className="relative">
          <div
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <Popover.Button as="div" className="cursor-default">
              <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
              >
                {renderContent()}
              </button>
            </Popover.Button>

            {isOpen && (
              <Popover.Panel static className="absolute z-10 -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap">
                {tooltip}
              </Popover.Panel>
            )}
          </div>
        </Popover>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 