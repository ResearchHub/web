'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWreathLaurel } from '@fortawesome/pro-light-svg-icons';

export function LeaderboardRank({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative w-8 min-w-8 h-6 flex items-center justify-center">
        <FontAwesomeIcon icon={faWreathLaurel} className="text-yellow-500 text-2xl absolute" />
        <span className="relative text-gray-700 text-xs font-bold z-10">1</span>
      </div>
    );
  }
  return (
    <span className="font-semibold text-base w-8 min-w-8 text-center text-gray-500">{rank}</span>
  );
}
