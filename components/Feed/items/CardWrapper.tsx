import Link from 'next/link';
import { cn } from '@/utils/styles';

interface CardWrapperProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  isClickable?: boolean;
}

const defaultClassName =
  'block w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
const defaultHoverClassName =
  'group hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer';

export const CardWrapper = ({
  href,
  children,
  className,
  isClickable = true,
}: CardWrapperProps) => {
  const wrapperClassName = cn(defaultClassName, isClickable && defaultHoverClassName, className);

  if (href) {
    return (
      <Link href={href} className={wrapperClassName}>
        {children}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{children}</div>;
};
