'use client';

import { useState } from 'react';
import { CircleCheck, Unplug } from 'lucide-react';
import { ConnectProfileModal } from '@/components/Notebook/ConnectProfileModal';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

/**
 * The writer's publication record, stated under the assistant's input: the
 * assistant drafts from ORCID or Google Scholar, so the line says whether it
 * has one to use. Either way it opens the dialog that links them — to connect
 * the first source, or to change what is connected.
 */
export function ResearcherProfileStatus({ className }: { readonly className?: string }) {
  const { user } = useUser();
  const author = user?.authorProfile;
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!author) return null;

  const connected = Boolean(author.isOrcidConnected || author.googleScholar);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title={
          connected
            ? 'Edit your connected ORCID or Google Scholar'
            : 'Connect ORCID or Google Scholar for better drafts'
        }
        className={cn(
          'group inline-flex max-w-full items-center gap-1.5 rounded text-xs font-medium text-gray-900',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          className
        )}
      >
        {connected ? (
          <>
            <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
            <span className="truncate">Using connected researcher profile</span>
            {/* Always underlined, not just on hover: the line reads as a
                statement, and this is what says it can be changed. */}
            <span className="shrink-0 font-normal text-gray-500 underline underline-offset-2 group-hover:text-gray-900">
              Edit
            </span>
          </>
        ) : (
          <>
            <Unplug className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate underline-offset-2 group-hover:underline">
              Connect ORCID or Google Scholar
            </span>
          </>
        )}
      </button>
      <ConnectProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
