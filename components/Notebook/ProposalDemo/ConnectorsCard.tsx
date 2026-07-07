'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { OpenAlexLogo } from './OpenAlexLogo';
import { ORCID_PROFILE, OPENALEX_PROFILE } from './mockData';

interface ConnectorChipProps {
  logo: React.ReactNode;
  name: string;
  id: string;
  url: string;
}

function ConnectorChip({ logo, name, id, url }: ConnectorChipProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={`${name}: ${id}`}
      className="group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1 transition-colors hover:border-gray-300 hover:bg-gray-50"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">{logo}</span>
      <span className="text-xs font-medium text-gray-800">{name}</span>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" title="Connected" />
    </a>
  );
}

// Compact "profile context" strip shown inside the chat composer, echoing
// Cursor's context pills. Kept as the tour anchor for the connectors step.
export function ConnectorsCard() {
  return (
    <div data-tour="proposal-demo-connectors" className="flex items-center gap-1.5">
      <ConnectorChip
        logo={<FontAwesomeIcon icon={faOrcid} className="h-4 w-4 text-orcid-500" />}
        name="ORCID"
        id={ORCID_PROFILE.id}
        url={ORCID_PROFILE.url}
      />
      <ConnectorChip
        logo={<OpenAlexLogo className="h-4 w-4" />}
        name="OpenAlex"
        id={OPENALEX_PROFILE.id}
        url={OPENALEX_PROFILE.url}
      />
    </div>
  );
}
