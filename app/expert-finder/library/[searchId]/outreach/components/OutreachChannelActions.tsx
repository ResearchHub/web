'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/styles';
import type { ExpertSourceLink } from '@/types/expertFinder';
import {
  buildMailtoHref,
  copyOutreachBodyToClipboard,
  getSourceUrlByNetwork,
} from '@/app/expert-finder/lib/outreachChannels';

export interface OutreachChannelActionsProps {
  expertEmail: string;
  emailSubject: string;
  /** HTML message body; copied to clipboard before opening a channel. */
  emailBody?: string;
  sources?: ExpertSourceLink[] | null;
  className?: string;
}

const channelButtonClass = (enabled: boolean) =>
  cn(
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    enabled ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-50'
  );

export function OutreachChannelActions({
  expertEmail,
  emailSubject,
  emailBody = '',
  sources,
  className,
}: OutreachChannelActionsProps) {
  const email = expertEmail.trim();
  const linkedinUrl = getSourceUrlByNetwork(sources, 'linkedin');
  const xUrl = getSourceUrlByNetwork(sources, 'x');

  const copyBodyThen = async (next: () => void) => {
    if (emailBody.trim()) {
      const ok = await copyOutreachBodyToClipboard(emailBody);
      if (ok) {
        toast.success('Message body copied');
      } else {
        toast.error('Could not copy message body');
      }
    }
    next();
  };

  const handleEmail = () => {
    if (!email) return;
    void copyBodyThen(() => {
      window.location.href = buildMailtoHref({ to: email, subject: emailSubject });
    });
  };

  const openProfile = (url: string) => {
    // Open blank tab synchronously so the click stays a valid user gesture after await.
    const win = window.open('about:blank', '_blank');
    void (async () => {
      if (emailBody.trim()) {
        const ok = await copyOutreachBodyToClipboard(emailBody);
        if (ok) {
          toast.success('Message body copied');
        } else {
          toast.error('Could not copy message body');
        }
      }
      if (win) {
        win.opener = null;
        win.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    })();
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)} role="group" aria-label="Send">
      <span className="text-sm font-medium text-gray-700">Send:</span>
      <button
        type="button"
        className={channelButtonClass(Boolean(xUrl))}
        disabled={!xUrl}
        aria-label="Send via X"
        title={xUrl ? 'Copy body and open X profile' : 'No X profile available'}
        onClick={() => xUrl && openProfile(xUrl)}
      >
        <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4 text-gray-900" aria-hidden />
      </button>
      <button
        type="button"
        className={channelButtonClass(Boolean(linkedinUrl))}
        disabled={!linkedinUrl}
        aria-label="Send via LinkedIn"
        title={
          linkedinUrl ? 'Copy body and open LinkedIn profile' : 'No LinkedIn profile available'
        }
        onClick={() => linkedinUrl && openProfile(linkedinUrl)}
      >
        <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4 text-[#0077B5]" aria-hidden />
      </button>
      <button
        type="button"
        className={channelButtonClass(Boolean(email))}
        disabled={!email}
        aria-label="Send via Email"
        title={email ? 'Copy body and open email' : 'No email available'}
        onClick={handleEmail}
      >
        <Mail className="h-4 w-4 text-gray-600" aria-hidden />
      </button>
    </div>
  );
}
