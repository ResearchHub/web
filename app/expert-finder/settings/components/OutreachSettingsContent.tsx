'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Info, Loader2, Mail, Pencil, Plus, Trash2, Unplug } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getOutreachCampaignStatusPresentation } from '@/app/expert-finder/lib/outreachCampaignStatus';
import { getOutreachMailboxProviderLabel } from '@/app/expert-finder/lib/outreachMailboxProviders';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { BaseSection } from '@/components/ui/BaseSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { Input } from '@/components/ui/form/Input';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { Modal } from '@/components/ui/form/Modal';
import { Tooltip } from '@/components/ui/Tooltip';
import { useUser } from '@/contexts/UserContext';
import {
  useConnectOutreachMailbox,
  useDetachOutreachMailbox,
  useInitOutreachOAuth,
  useOutreachCampaigns,
  useOutreachCapacity,
  useOutreachMailboxes,
  useOutreachOAuthSession,
  useUpdateOutreachMailbox,
} from '@/hooks/useExpertFinder';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ApiError } from '@/services/types/api';
import type { OutreachCampaign, OutreachMailbox, OutreachOAuthSession } from '@/types/expertFinder';
import { isValidEmail } from '@/utils/validation';
import { formatTimestamp } from '@/utils/date';

const GOOGLE_APP_PASSWORD_HELP_URL = 'https://support.google.com/accounts/answer/185833?hl=en';

const GOOGLE_WORKSPACE_OAUTH = {
  title: 'Connect Google Workspace',
  description: 'Sign in with a Google Workspace account (not @gmail.com).',
  successToast: 'Google Workspace mailbox connected',
} as const;

function CampaignCountsSummary({ campaign }: { campaign: OutreachCampaign }) {
  const { counts } = campaign;
  return (
    <p className="text-xs text-gray-500 mt-1">
      Queued {counts.queued} · Sent {counts.sent} · Opened {counts.opened} · Replied{' '}
      {counts.replied} · Bounced {counts.bounced}
    </p>
  );
}

function openOAuthWindow(authUrl: string): Window | null {
  const features = 'popup=yes,width=600,height=720,left=120,top=80';
  const popup = window.open(authUrl, 'expert-finder-outreach-oauth', features);
  if (popup && !popup.closed) {
    try {
      popup.focus();
    } catch {
      // Ignore focus errors from cross-origin popups.
    }
    return popup;
  }
  // Popup blocked — fall back to a new tab.
  return window.open(authUrl, '_blank', 'noopener,noreferrer');
}

export function OutreachSettingsContent() {
  const { user } = useUser();
  const isModerator = !!user?.isModerator;

  const [{ mailboxes, isLoading: mailboxesLoading, error: mailboxesError }, refetchMailboxes] =
    useOutreachMailboxes();
  const [{ capacity, isLoading: capacityLoading, error: capacityError }, refetchCapacity] =
    useOutreachCapacity();
  const [{ campaigns, isLoading: campaignsLoading, error: campaignsError }, refetchCampaigns] =
    useOutreachCampaigns();
  const [{ isLoading: isConnecting }, connectMailbox] = useConnectOutreachMailbox();
  const [{ isLoading: isUpdatingMailbox }, updateMailbox] = useUpdateOutreachMailbox();
  const [{ isLoading: isDetaching }, detachMailbox] = useDetachOutreachMailbox();
  const [{ isLoading: isInitiatingOAuth }, initOutreachOAuth] = useInitOutreachOAuth();
  const [
    { isPolling: isOAuthPolling, error: oauthPollError },
    { startPolling, cancel: cancelOAuthPolling },
  ] = useOutreachOAuthSession();

  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [detachTarget, setDetachTarget] = useState<OutreachMailbox | null>(null);
  const [editReplyMailbox, setEditReplyMailbox] = useState<OutreachMailbox | null>(null);
  const [editReplyTo, setEditReplyTo] = useState('');
  const [editReplyError, setEditReplyError] = useState<string | null>(null);

  const [showOauthFlow, setShowOauthFlow] = useState(false);
  const [oauthReplyTo, setOauthReplyTo] = useState('');
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [oauthWaiting, setOauthWaiting] = useState(false);
  const oauthPopupRef = useRef<Window | null>(null);

  const clearConnectForm = useCallback(() => {
    setEmail('');
    setAppPassword('');
    setReplyTo('');
    setConnectError(null);
  }, []);

  const closeOauthPopup = useCallback(() => {
    const popup = oauthPopupRef.current;
    oauthPopupRef.current = null;
    if (popup && !popup.closed) {
      try {
        popup.close();
      } catch {
        // Ignore close errors from cross-origin popups.
      }
    }
  }, []);

  const resetOauthFlow = useCallback(() => {
    cancelOAuthPolling();
    closeOauthPopup();
    setShowOauthFlow(false);
    setOauthReplyTo('');
    setOauthError(null);
    setOauthWaiting(false);
  }, [cancelOAuthPolling, closeOauthPopup]);

  useEffect(() => {
    if (!showConnectForm) clearConnectForm();
  }, [showConnectForm, clearConnectForm]);

  useEffect(() => {
    if (editReplyMailbox) {
      setEditReplyTo(editReplyMailbox.replyTo ?? '');
      setEditReplyError(null);
    }
  }, [editReplyMailbox]);

  useEffect(
    () => () => {
      cancelOAuthPolling();
      closeOauthPopup();
    },
    [cancelOAuthPolling, closeOauthPopup]
  );

  const trimmedEmail = email.trim();
  const trimmedReplyTo = replyTo.trim();
  const emailValid = trimmedEmail.length > 0 && isValidEmail(trimmedEmail);
  const replyToValid = trimmedReplyTo.length === 0 || isValidEmail(trimmedReplyTo);
  const canConnect =
    emailValid && replyToValid && appPassword.trim().length > 0 && !isConnecting && !isDetaching;

  const trimmedOauthReplyTo = oauthReplyTo.trim();
  const oauthReplyToValid = trimmedOauthReplyTo.length === 0 || isValidEmail(trimmedOauthReplyTo);
  const oauthBusy = isInitiatingOAuth || isOAuthPolling || oauthWaiting;

  const refreshAll = useCallback(async () => {
    await Promise.all([refetchMailboxes(), refetchCapacity(), refetchCampaigns()]);
  }, [refetchMailboxes, refetchCapacity, refetchCampaigns]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConnect) return;
    setConnectError(null);
    try {
      await connectMailbox({
        email: trimmedEmail,
        app_password: appPassword,
        ...(trimmedReplyTo ? { reply_to: trimmedReplyTo } : {}),
      });
      clearConnectForm();
      setShowConnectForm(false);
      toast.success('Gmail mailbox connected');
      await refreshAll();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setConnectError(
          extractApiErrorMessage(
            err,
            'This mailbox is already connected or owned by another editor.'
          )
        );
      } else {
        setConnectError(extractApiErrorMessage(err, 'Failed to connect mailbox'));
      }
    } finally {
      setAppPassword('');
    }
  };

  const handleSaveReplyTo = async () => {
    if (!editReplyMailbox) return;
    const next = editReplyTo.trim();
    if (next.length > 0 && !isValidEmail(next)) {
      setEditReplyError('Enter a valid email address');
      return;
    }
    setEditReplyError(null);
    try {
      await updateMailbox(editReplyMailbox.id, { reply_to: next });
      toast.success(next ? 'Reply-To updated' : 'Reply-To cleared');
      setEditReplyMailbox(null);
      await refetchMailboxes();
    } catch (err: unknown) {
      setEditReplyError(extractApiErrorMessage(err, 'Failed to update Reply-To'));
    }
  };

  const handleDetachConfirm = async () => {
    if (!detachTarget) return;
    try {
      await detachMailbox(detachTarget.id);
      toast.success(`Detached ${detachTarget.email}`);
      setDetachTarget(null);
      await refreshAll();
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Failed to detach mailbox'));
    }
  };

  const openOauthReplyModal = () => {
    if (oauthBusy) return;
    setShowConnectForm(false);
    cancelOAuthPolling();
    closeOauthPopup();
    setShowOauthFlow(true);
    setOauthReplyTo('');
    setOauthError(null);
    setOauthWaiting(false);
  };

  const handleOauthTerminal = useCallback(
    async (session: OutreachOAuthSession) => {
      closeOauthPopup();

      if (session.status === 'success') {
        setOauthWaiting(false);
        const label = GOOGLE_WORKSPACE_OAUTH.successToast;
        toast.success(session.mailbox?.email ? `${label}: ${session.mailbox.email}` : label);
        setShowOauthFlow(false);
        setOauthReplyTo('');
        setOauthError(null);
        await refreshAll();
        return;
      }

      // Keep the waiting modal open so the user can see the error and retry.
      setOauthWaiting(true);
      setOauthError(
        session.errorDescription ||
          (session.status === 'expired'
            ? 'Authorization expired. Please try again.'
            : 'Authorization failed. Please try again.')
      );
    },
    [closeOauthPopup, refreshAll]
  );

  const handleStartOauth = async () => {
    if (!showOauthFlow || !oauthReplyToValid || oauthBusy) return;
    setOauthError(null);

    try {
      const init = await initOutreachOAuth('google', {
        ...(trimmedOauthReplyTo ? { reply_to: trimmedOauthReplyTo } : {}),
      });
      if (!init.sessionId || !init.authUrl) {
        setOauthError('Authorization could not be started. Please try again.');
        return;
      }

      const popup = openOAuthWindow(init.authUrl);
      oauthPopupRef.current = popup;
      setOauthWaiting(true);

      startPolling(init.sessionId, {
        onTerminal: (session) => {
          void handleOauthTerminal(session);
        },
      });
    } catch (err: unknown) {
      setOauthWaiting(false);
      setOauthError(extractApiErrorMessage(err, 'Failed to start mailbox authorization'));
    }
  };

  const handleCancelOauth = () => {
    resetOauthFlow();
  };

  const showOauthReplyModal = showOauthFlow && !oauthWaiting && !isOAuthPolling;
  const showOauthWaitingModal = showOauthFlow && (oauthWaiting || isOAuthPolling);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Settings' }]} className="mb-2" />

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Outreach settings</h1>
        <p className="text-sm text-gray-600 mt-1">Connect a mailbox to send outreach.</p>
      </div>

      <BaseSection>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-semibold text-gray-900">Sending capacity</h2>
              <Tooltip
                content={
                  isModerator
                    ? 'Limits start low while a mailbox warms up. Raise daily limits and toggle warmup from Manage all mailboxes.'
                    : 'Limits start low while a mailbox warms up. Ask a moderator to raise capacity once it’s ready.'
                }
                position="top"
                width="w-64"
                className="text-left"
                wrapperClassName="inline-flex shrink-0 items-center"
              >
                <button
                  type="button"
                  className="inline-flex rounded p-0.5 text-gray-500 transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
                  aria-label="About sending capacity limits"
                >
                  <Info className="h-4 w-4 shrink-0" aria-hidden />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
        {capacityError ? <Alert variant="error">{capacityError}</Alert> : null}
        {capacityLoading && !capacity ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading capacity…
          </div>
        ) : capacity ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-gray-700">
                <span className="font-semibold text-gray-900">{capacity.remainingToday}</span> of{' '}
                <span className="font-semibold text-gray-900">{capacity.dailyLimitTotal}</span>{' '}
                remaining today
              </span>
              <span className="text-gray-500">Sent today: {capacity.sentToday}</span>
              <span className="text-gray-500">Active mailboxes: {capacity.activeMailboxCount}</span>
            </div>
            {capacity.activeMailboxCount === 0 ? (
              <Alert variant="warning">Connect a mailbox before sending.</Alert>
            ) : null}
            {capacity.mailboxes.length > 0 ? (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {capacity.mailboxes.map((mb) => (
                  <li
                    key={mb.email}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                      <span className="truncate text-gray-900">{mb.email}</span>
                    </div>
                    <span className="text-gray-500 tabular-nums">
                      {mb.remainingToday}/{mb.dailyLimit} left
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {isModerator ? (
          <Link
            href="/expert-finder/settings/mailboxes"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Manage all mailboxes
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </BaseSection>

      <BaseSection>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connected mailboxes</h2>
            <p className="text-sm text-gray-500">
              Personal Gmail (app password) or Google Workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!showConnectForm ? (
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                disabled={oauthBusy}
                onClick={() => setShowConnectForm(true)}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Connect Gmail
              </Button>
            ) : null}
            <button
              type="button"
              disabled
              onClick={openOauthReplyModal}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <GoogleIcon className="h-4 w-4" />
              Sign in with Google Workspace
            </button>
          </div>
        </div>

        {mailboxesError ? <Alert variant="error">{mailboxesError}</Alert> : null}

        {showConnectForm ? (
          <form
            onSubmit={handleConnect}
            className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            {connectError ? <Alert variant="error">{connectError}</Alert> : null}
            <Input
              label="Gmail address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              autoComplete="username"
              required
              disabled={isConnecting}
              error={
                trimmedEmail.length > 0 && !emailValid ? 'Enter a valid email address' : undefined
              }
            />
            <div>
              <Input
                label="Google app password"
                type="password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder="16-character app password"
                autoComplete="new-password"
                required
                disabled={isConnecting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Requires an{' '}
                <a
                  href={GOOGLE_APP_PASSWORD_HELP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  app password
                </a>
                .
              </p>
            </div>
            <Input
              label="Reply-To (optional)"
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="replies@example.com"
              disabled={isConnecting}
              error={
                trimmedReplyTo.length > 0 && !replyToValid
                  ? 'Enter a valid email address'
                  : undefined
              }
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outlined"
                size="sm"
                disabled={isConnecting}
                onClick={() => setShowConnectForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!canConnect}
                className="gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Mail className="h-4 w-4" aria-hidden />
                )}
                Connect
              </Button>
            </div>
          </form>
        ) : null}

        {mailboxesLoading && mailboxes.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading mailboxes…
          </div>
        ) : mailboxes.length === 0 ? (
          <p className="text-sm text-gray-600">No mailboxes connected yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {mailboxes.map((mailbox) => {
              const providerLabel = getOutreachMailboxProviderLabel(mailbox.providerCode);
              return (
                <li
                  key={mailbox.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {mailbox.email}
                      </span>
                      {providerLabel ? (
                        <span className="text-xs text-gray-500">{providerLabel}</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        Reply-To: {mailbox.replyTo || '—'}
                        <button
                          type="button"
                          className="inline-flex rounded p-0.5 text-gray-500 transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:opacity-50"
                          aria-label="Edit Reply-To"
                          title="Edit Reply-To"
                          disabled={isUpdatingMailbox || mailbox.status === 'disconnecting'}
                          onClick={() => setEditReplyMailbox(mailbox)}
                        >
                          <Pencil className="h-3 w-3 shrink-0" aria-hidden />
                        </button>
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="outlined"
                    size="sm"
                    className="gap-2"
                    disabled={isDetaching || mailbox.status === 'disconnecting'}
                    onClick={() => setDetachTarget(mailbox)}
                  >
                    <Unplug className="h-4 w-4" aria-hidden />
                    Detach
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </BaseSection>

      <BaseSection>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Published campaigns</h2>
        </div>
        {campaignsError ? <Alert variant="error">{campaignsError}</Alert> : null}
        {campaignsLoading && campaigns.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading campaigns…
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-gray-600">
            No published campaigns yet.{' '}
            <Link
              href="/expert-finder/templates"
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              Open templates
            </Link>{' '}
            to publish one.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {campaigns.map((campaign) => {
              const title =
                campaign.name?.trim() ||
                campaign.templateName?.trim() ||
                `Campaign #${campaign.id}`;
              const status = getOutreachCampaignStatusPresentation(campaign.status);
              return (
                <li key={campaign.id} className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/expert-finder/campaigns/${campaign.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {title}
                    </Link>
                    <Badge variant={status.variant} size="sm">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {campaign.templateName ? `${campaign.templateName} · ` : ''}
                    {campaign.publishedSubject || '—'}
                    {campaign.publishedAt
                      ? ` · Published ${formatTimestamp(campaign.publishedAt, false)}`
                      : ''}
                  </p>
                  <CampaignCountsSummary campaign={campaign} />
                </li>
              );
            })}
          </ul>
        )}
      </BaseSection>

      <Modal
        isOpen={showOauthReplyModal}
        onClose={() => !isInitiatingOAuth && resetOauthFlow()}
        title={GOOGLE_WORKSPACE_OAUTH.title}
      >
        <p className="text-sm text-gray-600 mb-3">{GOOGLE_WORKSPACE_OAUTH.description}</p>
        {oauthError ? <Alert variant="error">{oauthError}</Alert> : null}
        <Input
          label="Reply-To (optional)"
          type="email"
          value={oauthReplyTo}
          onChange={(e) => setOauthReplyTo(e.target.value)}
          placeholder="replies@example.com"
          disabled={isInitiatingOAuth}
          error={
            trimmedOauthReplyTo.length > 0 && !oauthReplyToValid
              ? 'Enter a valid email address'
              : undefined
          }
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outlined"
            size="sm"
            disabled={isInitiatingOAuth}
            onClick={handleCancelOauth}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            size="sm"
            disabled={!oauthReplyToValid || isInitiatingOAuth}
            onClick={() => void handleStartOauth()}
            className="gap-2 shadow-sm"
          >
            {isInitiatingOAuth ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            Continue with Google
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showOauthWaitingModal}
        onClose={handleCancelOauth}
        title="Waiting for authorization…"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin shrink-0 mt-0.5" aria-hidden />
            <p>Complete sign-in in the popup or new tab.</p>
          </div>
          {oauthPollError ? <Alert variant="warning">{oauthPollError}</Alert> : null}
          {oauthError ? <Alert variant="error">{oauthError}</Alert> : null}
          <div className="flex justify-end gap-2">
            {oauthError ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  cancelOAuthPolling();
                  closeOauthPopup();
                  setOauthWaiting(false);
                  setOauthError(null);
                }}
              >
                Try again
              </Button>
            ) : null}
            <Button variant="outlined" size="sm" onClick={handleCancelOauth}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={editReplyMailbox != null}
        onClose={() => !isUpdatingMailbox && setEditReplyMailbox(null)}
        title="Edit Reply-To"
      >
        {editReplyMailbox?.email ? (
          <p className="text-sm text-gray-600 mb-3">{editReplyMailbox.email}</p>
        ) : null}
        {editReplyError ? <Alert variant="error">{editReplyError}</Alert> : null}
        <Input
          label="Reply-To"
          type="email"
          value={editReplyTo}
          onChange={(e) => setEditReplyTo(e.target.value)}
          placeholder="replies@example.com"
          disabled={isUpdatingMailbox}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outlined"
            size="sm"
            disabled={isUpdatingMailbox}
            onClick={() => setEditReplyMailbox(null)}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={isUpdatingMailbox}
            onClick={() => void handleSaveReplyTo()}
            className="gap-2"
          >
            {isUpdatingMailbox ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Save
          </Button>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={detachTarget != null}
        onClose={() => setDetachTarget(null)}
        title="Detach mailbox?"
        description={detachTarget ? `Remove ${detachTarget.email}?` : ''}
        confirmLabel="Detach"
        confirmVariant="destructive"
        confirmIcon={<Trash2 className="h-4 w-4" aria-hidden />}
        isConfirming={isDetaching}
        onConfirm={handleDetachConfirm}
      />
    </div>
  );
}
