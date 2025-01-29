import { cn } from '@/utils/styles';

interface PageHeaderProps {
  title: string;
  className?: string;
}

export function PageHeader({ title, className }: PageHeaderProps) {
  return <h1 className={cn('text-4xl font-bold text-gray-900 mb-4', className)}>{title}</h1>;
}
