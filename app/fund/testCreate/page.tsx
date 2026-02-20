'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { CreateGrantButton } from '@/components/Grant/CreateGrantButton';
import { EditGrantModal } from '@/components/Grant/EditGrantModal';
import { GrantModalService, GrantForModal } from '@/services/grantModal.service';
import { useUser } from '@/contexts/UserContext';

export default function CreateGrantPage() {
  const { user } = useUser();
  const [grants, setGrants] = useState<GrantForModal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchGrants = async () => {
      try {
        const results = await GrantModalService.getGrantsByUser(user.id);
        setGrants(results);
      } catch (err) {
        console.error('Failed to fetch grants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrants();
  }, [user?.id]);

  return (
    <PageLayout rightSidebar={false}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
        {!isLoading && grants.length > 0 && (
          <div className="w-full max-w-4xl px-4">
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-min">
                {grants.map((grant) => (
                  <button
                    key={grant.id}
                    disabled={!grant.noteId}
                    onClick={() => grant.noteId && setSelectedNoteId(grant.noteId)}
                    className="flex-shrink-0 px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                    title={grant.noteId ? `Edit: ${grant.title}` : 'No linked note'}
                  >
                    {grant.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {!isLoading && grants.length === 0 && <p className="text-sm text-gray-500">No RFPs yet</p>}

        <CreateGrantButton />

        {selectedNoteId && (
          <EditGrantModal
            isOpen={Boolean(selectedNoteId)}
            onClose={() => setSelectedNoteId(null)}
            noteId={selectedNoteId}
          />
        )}
      </div>
    </PageLayout>
  );
}
