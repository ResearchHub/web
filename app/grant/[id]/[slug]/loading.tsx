import DocumentSkeleton from '@/components/skeletons/DocumentSkeleton';

export default function GrantSlugLoading() {
  return (
    <div className="py-6">
      <div className="w-full h-[200px] sm:h-[280px] rounded-xl bg-gray-200 animate-pulse mb-6" />
      <DocumentSkeleton className="max-w-[860px] !px-0 !pt-0" lines={12} />
    </div>
  );
}
