'use client';

import { Logo } from '@/components/ui/Logo';
import { CatalystNyc } from './CatalystNyc';

export type CatalystLockupVariant = 'arrival' | 'auth' | 'loggedIn';

const LOCKUP_SIZES: Record<
  CatalystLockupVariant,
  { logo: number; nyc: number; gap: number; divHeight: number; catFont: number; catGap: number }
> = {
  arrival: { logo: 25, nyc: 15, gap: 13, divHeight: 22, catFont: 21, catGap: 9 },
  auth: { logo: 23, nyc: 13, gap: 11, divHeight: 20, catFont: 18, catGap: 8 },
  loggedIn: { logo: 23, nyc: 13, gap: 11, divHeight: 20, catFont: 18, catGap: 8 },
};

interface CatalystLockupProps {
  variant: CatalystLockupVariant;
}

export function CatalystLockup({ variant }: CatalystLockupProps) {
  const sizes = LOCKUP_SIZES[variant];

  return (
    <div className="lockup">
      <Logo variant="white" size={sizes.logo} />
      <span className="lockup__div" />
      <span className="lockup__cat">
        <b>Catalyst</b>
        <CatalystNyc fill="#FFFFFF" height={sizes.nyc} />
      </span>

      <style jsx>{`
        .lockup {
          display: flex;
          align-items: center;
          gap: ${sizes.gap}px;
        }
        .lockup__div {
          width: 1px;
          height: ${sizes.divHeight}px;
          background: rgba(255, 255, 255, 0.32);
        }
        .lockup__cat {
          display: flex;
          align-items: baseline;
          gap: ${sizes.catGap}px;
        }
        .lockup__cat b {
          font-size: ${sizes.catFont}px;
          font-weight: 600;
          letter-spacing: -0.04em;
        }
      `}</style>
    </div>
  );
}
