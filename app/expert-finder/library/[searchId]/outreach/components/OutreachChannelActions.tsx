'use client';

import type { MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Mail, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/styles';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
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
  size?: 'sm' | 'md';
}

export function OutreachChannelActions({
  expertEmail,
  emailSubject,
  emailBody = '',
  sources,
  className,
  size = 'md',
}: OutreachChannelActionsProps) {
  const email = expertEmail.trim();
  const linkedinUrl = getSourceUrlByNetwork(sources, 'linkedin');
  const xUrl = getSourceUrlByNetwork(sources, 'x');
  const hasAnyChannel = Boolean(email || linkedinUrl || xUrl);
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const isSm = size === 'sm';

  const stopRowClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

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
    <div
      className={cn('inline-flex', className)}
      onClick={stopRowClick}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <BaseMenu
        align="end"
        disabled={!hasAnyChannel}
        trigger={
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors',
              'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              isSm ? 'h-7 w-7' : 'h-8 w-8',
              !hasAnyChannel && 'cursor-not-allowed opacity-50 hover:bg-white'
            )}
            disabled={!hasAnyChannel}
            aria-label="Send message"
            title={hasAnyChannel ? 'Send via…' : 'No outreach channels available'}
          >
            <Send className={iconClass} aria-hidden />
          </button>
        }
      >
        <BaseMenuItem disabled={!email} onSelect={handleEmail}>
          <Mail className="h-4 w-4 mr-2 shrink-0 text-gray-600" aria-hidden />
          <span>Email</span>
        </BaseMenuItem>
        <BaseMenuItem disabled={!xUrl} onSelect={() => xUrl && openProfile(xUrl)}>
          <FontAwesomeIcon
            icon={faXTwitter}
            className="h-4 w-4 mr-2 shrink-0 text-gray-900"
            aria-hidden
          />
          <span>X</span>
        </BaseMenuItem>
        <BaseMenuItem
          disabled={!linkedinUrl}
          onSelect={() => linkedinUrl && openProfile(linkedinUrl)}
        >
          <FontAwesomeIcon
            icon={faLinkedin}
            className="h-4 w-4 mr-2 shrink-0 text-[#0077B5]"
            aria-hidden
          />
          <span>LinkedIn</span>
        </BaseMenuItem>
      </BaseMenu>
    </div>
  );
}
