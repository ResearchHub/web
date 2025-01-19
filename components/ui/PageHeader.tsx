import { LargeHeader } from './LargeHeader';

interface PageHeaderProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, className, children }: PageHeaderProps) {
  return (
    <div className="">
      <div className="max-w-screen-xl mx-auto py-4">
        <div className="flex flex-col gap-6">
          <LargeHeader>{title}</LargeHeader>
          {children}
        </div>
      </div>
    </div>
  );
}
