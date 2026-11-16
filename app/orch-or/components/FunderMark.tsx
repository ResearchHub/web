import Image from 'next/image';
import { ORCH_OR_RFP } from '../data/mockRfp';

/**
 * The Athanatos Foundation's mark, from the funder fields in
 * `data/mockRfp.ts`: its ResearchHub avatar (round) where one is set, or its
 * logo with `logo`, and the monogram until either exists.
 */
export function FunderMark({ size = 40, logo = false }: { size?: number; logo?: boolean }) {
  const { funder } = ORCH_OR_RFP;
  if (logo && funder.logoUrl) {
    return (
      <Image
        src={funder.logoUrl}
        alt=""
        width={size * 4}
        height={size}
        style={{ height: size, width: 'auto', maxWidth: size * 4 }}
        className="shrink-0 rounded-[14%] object-contain"
      />
    );
  }
  if (funder.avatarUrl) {
    return (
      <Image
        src={funder.avatarUrl}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover ring-1 ring-[color:var(--o-line-2)]"
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-[color:var(--o-line-2)] bg-[var(--o-ink2)] font-[family-name:var(--font-orch-serif)] text-[var(--o-text)]"
    >
      {funder.monogram}
    </span>
  );
}
