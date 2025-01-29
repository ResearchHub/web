interface LargeHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function LargeHeader({ children, className }: LargeHeaderProps) {
  return <h1 className={`text-4xl font-bold text-gray-900 ${className || ''}`}>{children}</h1>;
}
