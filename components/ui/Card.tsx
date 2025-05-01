import { cn } from '@/utils/styles';
import { ReactNode } from 'react';
import Link from 'next/link';

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function Card({ children, className, href, onClick }: CardProps) {
  const baseStyles = (interactive: boolean) =>
    cn(
      'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
      interactive &&
        'group hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer',
      className
    );

  const content = <div className="p-4">{children}</div>;

  if (href) {
    return (
      <Link href={href} className={baseStyles(true)}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={baseStyles(true)}>
        {content}
      </div>
    );
  }

  return <div className={baseStyles(false)}>{content}</div>;
}
