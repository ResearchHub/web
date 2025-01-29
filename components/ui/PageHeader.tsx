import { cn } from '@/utils/styles';
import { LargeHeader } from './LargeHeader';

interface PageHeaderProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({ title, className, children, icon }: PageHeaderProps) {
  return (
    <div className="">
      <div className="max-w-screen-xl mx-auto">
        <div className={cn('flex flex-col', className)}>
          <div className="flex items-center">
            <LargeHeader>{title}</LargeHeader>
          </div>
        </div>
      </div>
    </div>
  );
}
