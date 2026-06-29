'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { CatalystArrivalBody } from './CatalystArrivalBody';
import { CatalystLockup } from './CatalystLockup';

interface CatalystDesktopOfferProps {
  onClaim: () => void;
}

export function CatalystDesktopOffer({ onClaim }: CatalystDesktopOfferProps) {
  return (
    <PageLayout rightSidebar={false}>
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="offer-card">
          <div className="offer-card__bg" />
          <div className="offer-card__grid" />
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
        .offer-card__bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            108% 86% at 24% 22%,
            #7b43be 0%,
            #5a2db0 24%,
            #3a1f86 46%,
            #20104e 72%,
            #0c0720 100%
          );
        }
        .offer-card__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 22px 22px;
          -webkit-mask-image: radial-gradient(120% 100% at 30% 20%, transparent 35%, #000 100%);
          mask-image: radial-gradient(120% 100% at 30% 20%, transparent 35%, #000 100%);
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
