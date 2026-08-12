'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ShareLinkService } from '@/services/shareLink.service';
import { SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';
import { ID } from '@/types/root';
import { ShareLink } from '@/types/shareLink';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  unifiedDocumentId: ID;
  /** Path to the proposal, without the token. */
  proposalPath: string;
}

const formatExpiry = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export function ShareLinkModal({
  isOpen,
  onClose,
  unifiedDocumentId,
  proposalPath,
}: ShareLinkModalProps) {
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;
    setIsLoading(true);
    setError(null);
    setIsCopied(false);

    ShareLinkService.get(unifiedDocumentId)
      .then((link) => {
        if (isCurrent) setShareLink(link);
      })
      .catch((err) => {
        if (isCurrent) setError(extractApiErrorMessage(err, 'Failed to load sharing settings'));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, unifiedDocumentId]);

  const isOn = shareLink !== null;
  const shareUrl = shareLink
    ? `${globalThis.location?.origin ?? ''}${proposalPath}?${SHARE_TOKEN_PARAM}=${shareLink.token}`
    : '';

  const enableSharing = useCallback(async () => {
    setIsUpdating(true);
    setError(null);
    try {
      setShareLink(await ShareLinkService.enable(unifiedDocumentId));
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Failed to turn on sharing'));
    } finally {
      setIsUpdating(false);
    }
  }, [unifiedDocumentId]);

  const disableSharing = useCallback(async () => {
    setIsUpdating(true);
    setError(null);
    try {
      await ShareLinkService.disable(unifiedDocumentId);
      setShareLink(null);
      setIsCopied(false);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Failed to turn off sharing'));
    } finally {
      setIsUpdating(false);
    }
  }, [unifiedDocumentId]);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      enableSharing();
    } else {
      disableSharing();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading sharing settings...
        </div>
      );
    }

    if (!isOn) {
      return null;
    }

    return (
      <div className="space-y-2">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            readOnly
            value={shareUrl}
            aria-label="Shareable link"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-l-md border border-gray-300 bg-gray-50 p-2 text-sm text-gray-700 focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="-ml-px inline-flex items-center gap-2 rounded-r-md border border-gray-300 bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-xs text-gray-500">Expires {formatExpiry(shareLink.expiresAt)}.</p>
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Share this proposal"
      size="md"
      footer={
        <Button variant="outlined" onClick={onClose} className="w-full">
          Done
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-900">Toggle link sharing</p>
          <Switch
            checked={isOn}
            onCheckedChange={handleToggle}
            disabled={isLoading || isUpdating}
            className="shrink-0"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {renderBody()}
      </div>
    </BaseModal>
  );
}
