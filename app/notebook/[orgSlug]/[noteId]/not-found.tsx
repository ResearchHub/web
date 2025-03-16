'use client';

export default function NoteNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Note Not Found</h1>
        <p className="text-gray-600 mb-6">
          The note you're looking for doesn't exist or you don't have permission to view it.
        </p>
      </div>
    </div>
  );
}
