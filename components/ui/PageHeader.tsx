import { cn } from '@/utils/styles';
import { LargeHeader } from './LargeHeader';

interface PageHeaderProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({ title, className, children, badge, icon }: PageHeaderProps) {
  return (
    <div className="">
      <div className="max-w-screen-xl mx-auto py-4">
        <div className={cn('flex flex-col gap-6', className)}>
          {icon}
          <div>
            {badge}
            <div className="flex items-center gap-2">
              <LargeHeader>{title}</LargeHeader>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
