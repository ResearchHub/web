export function TransactionSkeleton() {
  return (
    <div className="py-4 flex items-center justify-between animate-pulse px-4 -mx-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-40"></div>
      </div>
      <div className="text-right">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
} 