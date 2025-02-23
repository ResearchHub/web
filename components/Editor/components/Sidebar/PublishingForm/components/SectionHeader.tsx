interface SectionHeaderProps {
  icon: any;
  children: React.ReactNode;
}

export function SectionHeader({ icon: Icon, children }: SectionHeaderProps) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="h-4 w-4 text-gray-700" />
        <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">{children}</h3>
      </div>
    </div>
  );
}
