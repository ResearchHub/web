'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { BaseModal } from '@/components/ui/BaseModal';
import type { AuthorProfile } from '@/types/authorProfile';

export interface PeopleModalPerson {
  readonly profile: AuthorProfile;
  /** A line under the name: the proposal they lead, or the one they backed. */
  readonly detail?: string;
  /** What passed between them and the user, already formatted. */
  readonly amount?: string;
}

interface PeopleModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly people: readonly PeopleModalPerson[];
}

/** Everyone behind a list on My Funding: the scientists the user backs, or their own funders. */
export function PeopleModal({ isOpen, onClose, title, people }: PeopleModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <ul className="space-y-1">
        {people.map(({ profile, detail, amount }) => (
          <li key={profile.id}>
            <Link
              href={`/author/${profile.id}`}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
            >
              <Avatar
                src={profile.profileImage}
                alt={profile.fullName}
                size="sm"
                disableTooltip
                className="flex-shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">
                  {profile.fullName}
                </span>
                {detail && <span className="block truncate text-xs text-gray-500">{detail}</span>}
              </span>
              {amount && (
                <span className="shrink-0 font-mono text-sm font-semibold text-gray-900">
                  {amount}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </BaseModal>
  );
}
