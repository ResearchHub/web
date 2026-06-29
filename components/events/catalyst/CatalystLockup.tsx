'use client';

import { Logo } from '@/components/ui/Logo';
import { CatalystNyc } from './CatalystNyc';

const LOGO_SIZE = 25;
const NYC_HEIGHT = 15;
const GAP = 13;
const DIV_HEIGHT = 22;
const CAT_FONT = 21;
const CAT_GAP = 9;

interface CatalystLockupProps {
  theme?: 'onDark' | 'onLight';
}

export function CatalystLockup({ theme = 'onDark' }: CatalystLockupProps) {
  const onDark = theme === 'onDark';

  return (
    <div className="lockup">
      <Logo variant={onDark ? 'white' : 'default'} size={LOGO_SIZE} />
      <span className={`lockup__div ${onDark ? 'lockup__div--dark' : 'lockup__div--light'}`} />
      <span className="lockup__cat">
        <b className={onDark ? 'lockup__cat--dark' : 'lockup__cat--light'}>Catalyst</b>
        <CatalystNyc fill={onDark ? '#FFFFFF' : '#7C3AED'} height={NYC_HEIGHT} />
      </span>

      <style jsx>{`
        .lockup {
          display: flex;
          align-items: center;
          gap: ${GAP}px;
        }
        .lockup__div {
          width: 1px;
          height: ${DIV_HEIGHT}px;
        }
        .lockup__div--dark {
          background: rgba(255, 255, 255, 0.32);
        }
        .lockup__div--light {
          background: rgba(0, 0, 0, 0.15);
        }
        .lockup__cat {
          display: flex;
          align-items: baseline;
          gap: ${CAT_GAP}px;
        }
        .lockup__cat b {
          font-size: ${CAT_FONT}px;
          font-weight: 600;
          letter-spacing: -0.04em;
        }
        .lockup__cat--dark {
          color: #fff;
        }
        .lockup__cat--light {
          color: #0c0720;
        }
      `}</style>
    </div>
  );
}
