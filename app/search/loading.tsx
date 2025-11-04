'use client';

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      <span className="sr-only">Loading search…</span>
    </div>
  );
}
