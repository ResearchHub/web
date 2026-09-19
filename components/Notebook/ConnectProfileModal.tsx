'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faOrcid } from '@fortawesome/free-brands-svg-icons';
import { Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { OrcidConnectButton } from '@/components/Orcid/OrcidConnectButton';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';

const SCHOLAR_LINK_HINT =
  'Enter your Google Scholar profile link, like https://scholar.google.com/citations?user=…';

/**
 * A Google Scholar profile link: Scholar's own host (it also serves country
 * domains, e.g. scholar.google.co.uk), on the profile page, naming a user.
 * Anything else — a search results page, another site — gives the assistant
 * nothing to read.
 */
function isScholarProfileUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    url.protocol === 'https:' &&
    /^scholar\.google(\.[a-z]{2,3}){1,2}$/i.test(url.hostname) &&
    url.pathname.startsWith('/citations') &&
    Boolean(url.searchParams.get('user'))
  );
}

interface ConnectProfileModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/**
 * Links the writer's publication record from inside the notebook, by the same
 * two routes the profile page offers: ORCID's sign-in, which comes back to this
 * note, and the Google Scholar link saved on the author profile. The assistant
 * drafts from that record, so it is offered where the drafting happens.
 */
export function ConnectProfileModal({ isOpen, onClose }: ConnectProfileModalProps) {
  const { user, refreshUser } = useUser();
  const author = user?.authorProfile;
  const [{ isLoading: isSaving }, updateAuthorProfileData] = useUpdateAuthorProfileData();
  const [scholarUrl, setScholarUrl] = useState('');
  const [scholarError, setScholarError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setScholarUrl(author?.googleScholar ?? '');
    setScholarError(null);
  }, [isOpen, author?.googleScholar]);

  const saveScholar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = scholarUrl.trim();
    if (!isScholarProfileUrl(url)) {
      setScholarError(SCHOLAR_LINK_HINT);
      return;
    }
    if (!author?.id) return;
    try {
      await updateAuthorProfileData(author.id, { google_scholar: url });
      await refreshUser();
      toast.success('Google Scholar added');
    } catch {
      toast.error('Couldn’t save your Google Scholar link.');
    }
  };

  const scholarSaved =
    Boolean(author?.googleScholar) && author?.googleScholar === scholarUrl.trim();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Connect your researcher profile" size="md">
      <p className="text-sm text-gray-600">
        The assistant drafts from your publication record. Connect either one and it has your
        papers, fields and co-authors to work from.
      </p>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            <FontAwesomeIcon icon={faOrcid} className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-900">ORCID</div>
            <div className="text-xs text-gray-600">
              {author?.isOrcidConnected
                ? 'Your ORCID record is linked.'
                : 'Sign in to ORCID; you return to this note.'}
            </div>
          </div>
          {author?.isOrcidConnected ? (
            <Connected />
          ) : (
            <OrcidConnectButton size="sm" showIcon={false} />
          )}
        </div>

        <form onSubmit={saveScholar} className="rounded-xl border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <FontAwesomeIcon icon={faGoogle} className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900">Google Scholar</div>
              <div className="text-xs text-gray-600">Paste the link to your Scholar profile.</div>
            </div>
            {scholarSaved && <Connected />}
          </div>
          <div className="mt-3 flex items-start gap-2">
            <Input
              value={scholarUrl}
              onChange={(event) => {
                setScholarUrl(event.target.value);
                setScholarError(null);
              }}
              placeholder="https://scholar.google.com/citations?user=…"
              aria-label="Google Scholar profile link"
              error={scholarError ?? undefined}
              wrapperClassName="min-w-0 flex-1"
            />
            <Button type="submit" variant="outlined" disabled={isSaving || scholarSaved}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}

function Connected() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600">
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
      Connected
    </span>
  );
}
