'use client';

import { Clock, Star } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { SITE_CONFIG } from '@/lib/metadata';
import type { PourReviewPuzzle } from '@/types/pourReview';

interface PourReviewResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PourReviewPuzzle;
  pourCount: number;
}

export function PourReviewResultsModal({
  isOpen,
  onClose,
  puzzle,
  pourCount,
}: PourReviewResultsModalProps) {
  const { showAuthModal } = useAuthModalContext();
  const { stats } = puzzle;
  const poursOverPar = pourCount - puzzle.par;
  const title = `Pour Review #${puzzle.number}`;
  const shareText = [
    `${title} 🧪`,
    `${pourCount} pours · ${poursOverPar > 0 ? `${poursOverPar} over par` : 'Par ⭐'}`,
    ...(stats?.currentStreak ? [`🔥 ${stats.currentStreak}-day streak`] : []),
  ].join('\n');

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <h3 className="text-2xl font-extrabold text-gray-900">Solved in {pourCount} pours</h3>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-gray-600">
          {poursOverPar > 0 ? (
            `${poursOverPar} over par. Par is ${puzzle.par}.`
          ) : (
            <>
              <Star size={18} className="fill-amber-400 text-amber-400" />
              Par! That&apos;s the fewest pours possible.
            </>
          )}
        </p>
        <p className="mt-1 text-sm text-gray-500">{puzzle.parRate}% of players hit par today</p>
      </div>

      {stats ? (
        <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            [stats.played, 'Played'],
            [stats.currentStreak, 'Streak'],
            [`${stats.parRate}%`, 'At par'],
            [stats.bestStreak, 'Best streak'],
          ].map(([value, label]) => (
            <div
              key={label}
              className="flex flex-col-reverse gap-0.5 rounded-xl bg-gray-100 px-1 py-2.5"
            >
              <dt className="text-[11.5px] font-semibold text-gray-500">{label}</dt>
              <dd className="text-xl font-extrabold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <Button variant="outlined" className="mt-4 w-full" onClick={() => showAuthModal()}>
          Sign in to save your streak
        </Button>
      )}

      <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 font-mono text-sm text-gray-900">
        {shareText}
      </pre>
      <SocialShareButtons
        action="USER_SHARED_DOCUMENT"
        docTitle={title}
        url={`${SITE_CONFIG.url}/pour-review`}
        text={shareText}
        showCopyButton
      />
      <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-500">
        <Clock size={14} />
        Next puzzle at midnight ET
      </p>
    </BaseModal>
  );
}
