export function OnboardingAccordionSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-2 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-gray-200 rounded-full" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded ml-2" />
          </div>
          <div className="h-3 w-48 bg-gray-100 rounded mt-2" />
        </div>
      ))}
    </div>
  );
}
