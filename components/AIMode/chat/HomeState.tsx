'use client';

import type { ReactNode } from 'react';
import { Bell, Megaphone, PenLine } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faFileSignature } from '@fortawesome/pro-light-svg-icons';
import { useAIMode } from '../lib/AIModeContext';
import { ORG_PROFILE } from '../lib/orgProfile';
import type { AIModeTrack } from '../lib/types';
import { Composer, type SlashCommand } from './Composer';

const ICON_CLASS = 'h-[18px] w-[18px] text-gray-700';

/**
 * Publishing icons and tile treatment come from `PublishMenu` and the updates
 * bell from `UserMenu`, so each tile matches the place in ResearchHub the funder
 * would otherwise have gone to do the same thing.
 */
const TRACKS: {
  id: AIModeTrack;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    id: 'rfp',
    label: 'Open an RFP',
    description: 'Turn an idea into a funded call for proposals.',
    icon: <FontAwesomeIcon icon={faBullhorn} className={ICON_CLASS} />,
  },
  {
    id: 'proposal',
    label: 'Draft a new proposal',
    description: 'Write a preregistration for funding.',
    icon: <FontAwesomeIcon icon={faFileSignature} className={ICON_CLASS} />,
  },
  {
    id: 'updates',
    label: 'Get updates',
    description: 'Check on the work you have funded.',
    icon: <Bell className={ICON_CLASS} />,
  },
];

interface HomeStateProps {
  readonly firstName?: string;
}

/**
 * The empty state: composer centred in the panel with the three tracks beside
 * it, Claude/Cursor style. It docks to the bottom of the panel once the
 * conversation starts.
 */
export const HomeState = ({ firstName }: HomeStateProps) => {
  const { actions } = useAIMode();

  const commands: SlashCommand[] = [
    {
      id: 'rfp',
      label: 'Open an RFP',
      description: 'Draft and fund a call for proposals',
      icon: Megaphone,
      run: () => actions.startTrack('rfp'),
    },
    {
      id: 'proposal',
      label: 'Draft a proposal',
      description: 'Write a preregistration',
      icon: PenLine,
      run: () => actions.startTrack('proposal'),
    },
    {
      id: 'updates',
      label: 'Get updates',
      description: 'Check on funded work',
      icon: Bell,
      run: () => actions.startTrack('updates'),
    },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 pb-16">
      <div className="w-full max-w-[620px]">
        <div className="mb-5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-gray-600 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-700 text-[10px] font-bold text-white">
              {ORG_PROFILE.name.charAt(0)}
            </span>
            Funding as {ORG_PROFILE.name}
          </span>
        </div>
        <h1 className="text-center text-[28px] font-medium tracking-tight text-gray-900">
          {firstName ? `What should we fund, ${firstName}?` : 'What should we fund?'}
        </h1>
        <p className="mt-2 text-center text-[15px] text-gray-500">
          Describe the science you want to exist, or paste what started the idea.
        </p>

        <Composer
          autoFocus
          disabled={false}
          onSend={(value, attachments) => actions.sendMessage(value, { attachments })}
          placeholder="Paste a case file, a paper, a thread — or type / for commands…"
          className="mt-7"
          commands={commands}
        />

        <div className="mt-4 grid gap-2.5 min-[560px]:grid-cols-3">
          {TRACKS.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => actions.startTrack(track.id)}
              className="group rounded-xl border border-gray-200 bg-white p-3.5 text-left shadow-sm transition-colors hover:border-primary-300 hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition-colors duration-150 group-hover:bg-gray-50">
                {track.icon}
              </div>
              <div className="mt-2.5 text-sm font-semibold text-gray-900">{track.label}</div>
              <div className="mt-0.5 text-xs leading-snug text-gray-600">{track.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
