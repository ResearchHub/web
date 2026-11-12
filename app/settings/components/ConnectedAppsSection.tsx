'use client';

import { useState } from 'react';
import { Plug } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RevokeConnectedAppModal } from '@/components/modals/RevokeConnectedAppModal';
import { useConnectedApps } from '@/hooks/useConnectedApps';
import type { ConnectedApp } from '@/types/oauth';
import { formatTimeAgo } from '@/utils/date';

interface ConnectedAppListProps {
  apps: ConnectedApp[] | null;
  isLoading: boolean;
  error: string | null;
  onRevoke: (app: ConnectedApp) => void;
}

function ConnectedAppList({ apps, isLoading, error, onRevoke }: Readonly<ConnectedAppListProps>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!apps?.length) {
    return (
      <p className="text-sm text-gray-500">
        Apps you allow to access your ResearchHub account, such as AI assistants, will appear here.
      </p>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-500">
        Apps you’ve allowed to access your ResearchHub account, such as AI assistants.
      </p>
      <ul className="divide-y divide-gray-200">
        {apps.map((app) => (
          <li
            key={app.id}
            className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-gray-900">{app.name}</h3>
              <p className="text-sm text-gray-500">
                {app.scopes.map((scope) => scope.description).join(' · ')}
              </p>
              <p className="text-sm text-gray-400">Last used {formatTimeAgo(app.lastUsedAt)}</p>
            </div>
            <Button variant="outlined" size="sm" onClick={() => onRevoke(app)}>
              Revoke
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ConnectedAppsSection() {
  const { apps, isLoading, error, revoke } = useConnectedApps();
  const [selectedApp, setSelectedApp] = useState<ConnectedApp | null>(null);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);

  // Hidden while OAuth is disabled on the backend
  if (!isLoading && !error && apps === null) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="rounded-t-lg border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Plug className="h-5 w-5" />
          Connected apps
        </h2>
      </header>

      <div className="p-6">
        <ConnectedAppList
          apps={apps}
          isLoading={isLoading}
          error={error}
          onRevoke={(app) => {
            setSelectedApp(app);
            setIsRevokeOpen(true);
          }}
        />
      </div>

      <RevokeConnectedAppModal
        isOpen={isRevokeOpen}
        app={selectedApp}
        onClose={() => setIsRevokeOpen(false)}
        onRevoke={(app) => revoke(app.id)}
      />
    </section>
  );
}
