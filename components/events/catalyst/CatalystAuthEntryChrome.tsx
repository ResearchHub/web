'use client';

import { CATALYST_NYC_EVENT } from './constants';

const { auth } = CATALYST_NYC_EVENT;

interface CatalystAuthEntryTitleProps {
  surface: 'dark' | 'light';
}

export function CatalystAuthEntryTitle({ surface }: Readonly<CatalystAuthEntryTitleProps>) {
  const onDark = surface === 'dark';

  return (
    <>
      <h1 className={`title ${onDark ? 'title--dark' : 'title--light'}`}>
        {auth.titleLines[0]}
        <br />
        {auth.titleLines[1]}
      </h1>

      <style jsx>{`
        .title {
          font-size: 38px;
          font-weight: 600;
          letter-spacing: -0.03em;
          text-align: left;
          line-height: 1.05;
          margin-bottom: 30px;
        }
        .title--dark {
          color: #fff;
        }
        .title--light {
          color: #0c0720;
        }
      `}</style>
    </>
  );
}

interface CatalystAuthEntryNoteProps {
  surface: 'dark' | 'light';
}

function InfoGlyph({ stroke }: Readonly<{ stroke: string }>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function CatalystAuthEntryNote({ surface }: Readonly<CatalystAuthEntryNoteProps>) {
  const onDark = surface === 'dark';

  return (
    <>
      <p className={`note ${onDark ? 'note--dark' : 'note--light'}`}>
        <InfoGlyph stroke={onDark ? '#C8B6F2' : '#6B7280'} />
        <span>
          Use the <strong>{auth.noteHighlight}</strong>.
        </span>
      </p>

      <style jsx>{`
        .note {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
        }
        .note--dark {
          color: rgba(255, 255, 255, 0.82);
        }
        .note--dark strong {
          font-weight: 600;
          color: #fff;
        }
        .note--light {
          color: #4b5563;
        }
        .note--light strong {
          font-weight: 600;
          color: #111827;
        }
      `}</style>
    </>
  );
}
