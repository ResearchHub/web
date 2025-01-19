interface LargeHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function LargeHeader({ children, className }: LargeHeaderProps) {
  return (
    <h1 className={`text-2xl font-bold text-gray-900 leading-tight ${className || ''}`}>
      {children}
    </h1>
  );
}
