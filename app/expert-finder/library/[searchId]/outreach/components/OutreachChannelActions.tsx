'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import type { ExpertSourceLink, OutreachChannel } from '@/types/expertFinder';
import {
  buildGmailComposeHref,
  copyOutreachBodyToClipboard,
  getSourceUrlByNetwork,
} from '@/app/expert-finder/lib/outreachChannels';

export interface OutreachChannelActionsProps {
  expertEmail: string;
  emailSubject: string;
  /** HTML message body; copied to clipboard before opening a channel. */
  emailBody?: string;
  sources?: ExpertSourceLink[] | null;
  onChannelOpened?: (channel: OutreachChannel) => void;
  className?: string;
}

export function OutreachChannelActions({
  expertEmail,
  emailSubject,
  emailBody = '',
  sources,
  onChannelOpened,
  className,
}: OutreachChannelActionsProps) {
  const email = expertEmail.trim();
  const linkedinUrl = getSourceUrlByNetwork(sources, 'linkedin');
  const xUrl = getSourceUrlByNetwork(sources, 'x');

  const handleSendClick = (channel: OutreachChannel, url: string) => {
    const win = window.open('about:blank', '_blank');
    void (async () => {
      if (emailBody.trim()) {
        const ok = await copyOutreachBodyToClipboard(emailBody);
        if (ok) {
          toast.success('Outreach body copied');
        } else {
          toast.error('Could not copy outreach body');
        }
      }
      if (win) {
        win.opener = null;
        win.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      onChannelOpened?.(channel);
    })();
  };

  return (
    <div className={cn('flex flex-wrap items-center justify-end gap-2', className)} role="group">
      <Button
        type="button"
        variant="outlined"
        size="sm"
        className="gap-2"
        disabled={!xUrl}
        title={xUrl ? 'Copy body and open X profile' : 'No X profile available'}
        onClick={() => xUrl && handleSendClick('x', xUrl)}
      >
        <FontAwesomeIcon icon={faXTwitter} className="h-3.5 w-3.5 text-gray-900" aria-hidden />
        Send via X
      </Button>
      <Button
        type="button"
        variant="outlined"
        size="sm"
        className="gap-2"
        disabled={!linkedinUrl}
        title={
          linkedinUrl ? 'Copy body and open LinkedIn profile' : 'No LinkedIn profile available'
        }
        onClick={() => linkedinUrl && handleSendClick('linkedin', linkedinUrl)}
      >
        <FontAwesomeIcon icon={faLinkedin} className="h-3.5 w-3.5 text-[#0077B5]" aria-hidden />
        Send via LinkedIn
      </Button>
      <Button
        type="button"
        variant="outlined"
        size="sm"
        className="gap-2"
        disabled={!email}
        title={email ? 'Copy body and open Gmail' : 'No email available'}
        onClick={() =>
          email &&
          handleSendClick('email', buildGmailComposeHref({ to: email, subject: emailSubject }))
        }
      >
        <Mail className="h-3.5 w-3.5 text-gray-600" aria-hidden />
        Send via Email
      </Button>
    </div>
  );
}
