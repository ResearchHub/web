import Link from 'next/link';
import { CatalystLockup } from './CatalystLockup';
import { CATALYST_COLORS, CATALYST_TAGLINE } from './catalystTokens';

/**
 * Catalyst NYC face for the shared auth modal. Purely presentational: the auth
 * flow underneath is unchanged. Crediting the $500 is handled manually on the
 * backend against a registration email whitelist, hence the email reminder.
 */
export function CatalystAuthHeader() {
  return (
    <div className="mb-6">
      <CatalystLockup className="mb-4" />

      <div
        className="rounded-xl p-4 mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(123, 67, 190, 0.10), rgba(124, 58, 237, 0.05))',
          border: '1px solid rgba(124, 58, 237, 0.20)',
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase mb-1.5"
          style={{ letterSpacing: '0.16em', color: CATALYST_COLORS.royalViolet }}
        >
          {CATALYST_TAGLINE}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
          $500 in Funding Credits, on us.
        </h2>
        <p className="mt-2 text-sm text-gray-700 leading-snug">
          Sign up to receive <span className="font-semibold">$500</span> to fund real research. Your
          credits live in the{' '}
          <Link
            href="/endowment"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline decoration-dotted underline-offset-2"
            style={{ color: CATALYST_COLORS.accentViolet }}
          >
            ResearchHub Endowment
          </Link>{' '}
          and earn yield daily &mdash; your balance grows every day.
        </p>
      </div>

      <p className="text-xs text-gray-500">
        Use the email from your Catalyst NYC registration so we can credit your account.
      </p>
    </div>
  );
}
