import Feed2 from '@/app/components/Feed2';

export default function FeedPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Research Feed</h1>
        <Feed2 />
      </div>
    </main>
  );
} 