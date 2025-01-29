import { cn } from '@/utils/styles';
import { LargeHeader } from './LargeHeader';

interface PageHeaderProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

export function PageHeader({ title, className, children, badge }: PageHeaderProps) {
  return (
    <div className="">
      <div className="max-w-screen-xl mx-auto py-4">
        <div className={cn('flex flex-col gap-6', className)}>
          <div>
            {badge}
            <LargeHeader>{title}</LargeHeader>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
