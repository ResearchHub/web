export function WorkHeaderSkeleton() {
  return (
    <div className="w-full bg-gray-50/80 border-b border-gray-200 animate-pulse">
      <div className="max-w-[1180px] mx-auto px-4 tablet:!px-8 pt-6">
        <div className="flex-1 min-w-0">
          {/* Eyebrow */}
          <div className="mb-2.5">
            <div className="h-6 w-32 sm:w-40 rounded-md bg-gray-200" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-7 sm:h-9 w-full rounded-md bg-gray-200" />
            <div className="h-7 sm:h-9 w-2/3 rounded-md bg-gray-200" />
          </div>

          {/* Subtitle: authors + date */}
          <div className="mt-2.5 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-4 w-8 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
            </div>
            <div className="h-4 w-36 rounded bg-gray-200" />
          </div>

          {/* Action bar */}
          <div className="mt-3 pb-6 flex items-center gap-3">
            <div className="h-9 w-24 rounded-lg bg-gray-200" />
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkSkeleton() {
  return (
    <div className="animate-pulse mt-6">
      {/* Document body */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="h-6 w-24 rounded bg-gray-200" />
        <div className="space-y-2.5">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      </div>

      {/* PDF placeholder */}
      <div className="mt-6 bg-white rounded-lg border h-[400px] sm:h-[600px]" />
    </div>
  );
}
