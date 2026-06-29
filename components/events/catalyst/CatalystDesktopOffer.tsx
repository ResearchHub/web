'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { CatalystArrivalBody } from './CatalystArrivalBody';
import { CatalystLockup } from './CatalystLockup';
import { CatalystVioletBackdrop } from './CatalystVioletBackdrop';

interface CatalystDesktopOfferProps {
  onClaim: () => void;
}

export function CatalystDesktopOffer({ onClaim }: Readonly<CatalystDesktopOfferProps>) {
  return (
    <PageLayout rightSidebar={false}>
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="offer-card">
          <CatalystVioletBackdrop />
          <div className="offer-card__content">
            <CatalystLockup />
            <CatalystArrivalBody onClaim={onClaim} compact />
          </div>
        </div>
      </div>

      <style jsx>{`
        .offer-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          background: #0c0720;
          color: #fff;
        }
        .offer-card__content {
          position: relative;
          z-index: 1;
          padding: 40px 32px 36px;
        }
      `}</style>
    </PageLayout>
  );
}
