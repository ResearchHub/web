import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';
import styles from '@/app/giving-tuesday/components/WhyArt.module.css';

/** All three share one frame so the cards line up. */
function ArtFrame({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="50 20 300 260"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {children}
    </svg>
  );
}

/** A stopwatch whose hand keeps sweeping, with speed lines behind it. */
export function FastArt() {
  return (
    <ArtFrame>
      <circle cx="200" cy="150" r="118" fill="#F3F5FF" />
      <path
        className={styles.dash}
        d="M70 128h44M58 160h52M72 192h40"
        fill="none"
        stroke="#FFB547"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <rect x="186" y="54" width="28" height="16" rx="5" fill="#27307A" />
      <rect x="194" y="68" width="12" height="16" fill="#4C5BD4" />
      <rect
        x="258"
        y="86"
        width="22"
        height="12"
        rx="4"
        fill="#27307A"
        transform="rotate(45 269 92)"
      />
      <circle cx="200" cy="160" r="78" fill="#4C5BD4" />
      <circle cx="200" cy="160" r="62" fill="#ffffff" />
      <circle
        cx="200"
        cy="160"
        r="53"
        fill="none"
        stroke="#BFC8FF"
        strokeWidth="6"
        pathLength="100"
        strokeDasharray="1.2 7.133"
      />
      <circle
        cx="200"
        cy="160"
        r="36"
        fill="none"
        stroke="#FFB547"
        strokeWidth="14"
        pathLength="100"
        strokeDasharray="20 100"
        transform="rotate(-90 200 160)"
      />
      <g className={styles.spin}>
        <path d="M200 160V112" stroke="#27307A" strokeWidth="7" strokeLinecap="round" />
      </g>
      <circle cx="200" cy="160" r="8" fill="#27307A" />
    </ArtFrame>
  );
}

const PEOPLE: [cx: number, cy: number, color: string][] = [
  [118, 84, '#FFB547'],
  [284, 84, '#F27BA6'],
  [298, 168, '#8C6BE0'],
  [246, 230, '#4C5BD4'],
  [152, 230, '#FFB547'],
  [102, 168, '#F27BA6'],
];

/** One researcher in the middle, linked to reviewers all around. */
export function NetworkArt() {
  return (
    <ArtFrame>
      <circle cx="200" cy="150" r="118" fill="#EEFAF7" />
      <path
        className={styles.flow}
        d="M200 150L118 92M200 150L284 92M200 150L298 176M200 150L246 238M200 150L152 238M200 150L102 176"
        stroke="#A8E6D6"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {PEOPLE.map(([cx, cy, color], index) => (
        <g key={`${cx}-${cy}`} className={styles.pop} style={{ animationDelay: `${index * 0.3}s` }}>
          <circle cx={cx} cy={cy} r="11" fill={color} />
          <path d={`M${cx - 18} ${cy + 24}c2-9 9-13 18-13s16 4 18 13z`} fill={color} />
        </g>
      ))}
      <circle cx="200" cy="150" r="42" fill="#2BA889" />
      <circle cx="200" cy="138" r="13" fill="#ffffff" />
      <path d="M178 172c3-12 11-18 22-18s19 6 22 18z" fill="#ffffff" />
    </ArtFrame>
  );
}

const LINES = [112, 134, 156, 178];
const CHECKS = [styles.check1, styles.check2, styles.check3, styles.check4];

/** An AI helper highlights each line of a proposal; the scientist beside it checks it off. */
export function TogetherArt() {
  return (
    <ArtFrame label="An AI helper highlights each line of a proposal while a scientist checks it off">
      <circle cx="200" cy="150" r="118" fill="#F8F2FF" />
      <rect
        x="150"
        y="84"
        width="100"
        height="132"
        rx="10"
        fill="#ffffff"
        stroke="#D9C6FF"
        strokeWidth="3"
      />
      <g className={styles.beam}>
        <polygon points="122,128 172,114 172,142" fill="#FFB547" opacity="0.32" />
      </g>
      <g className={styles.highlight}>
        <rect x="158" y="103" width="66" height="18" rx="6" fill="#FFB547" opacity="0.55" />
      </g>
      <path
        d="M164 112h54M164 134h46M164 156h54M164 178h40"
        stroke="#D9C6FF"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {LINES.map((y, index) => (
        <path
          key={y}
          className={cn(styles.check, CHECKS[index])}
          pathLength="1"
          d={`M229 ${y}l5 5 9-11`}
          fill="none"
          stroke="#2BA889"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* The AI helper */}
      <path d="M100 104V92" stroke="#4A2A86" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="88" r="6" fill="#FFB547" />
      <rect x="80" y="148" width="40" height="46" rx="12" fill="#8C5BE0" />
      <rect x="90" y="160" width="20" height="8" rx="4" fill="#D9C6FF" />
      <rect x="74" y="104" width="52" height="42" rx="13" fill="#8C5BE0" />
      <rect x="82" y="113" width="36" height="24" rx="8" fill="#4A2A86" />
      <circle className={styles.blink} cx="93" cy="125" r="4" fill="#D9C6FF" />
      <circle className={styles.blink} cx="107" cy="125" r="4" fill="#D9C6FF" />

      {/* The scientist, pen in hand */}
      <g className={styles.pen}>
        <path d="M286 196L252 166" stroke="#4C5BD4" strokeWidth="13" strokeLinecap="round" />
        <path d="M248 162L238 151" stroke="#4A2A86" strokeWidth="5" strokeLinecap="round" />
        <circle cx="251" cy="165" r="8" fill="#F5C9A6" />
      </g>
      <path d="M268 216c3-30 16-46 34-46s31 16 34 46z" fill="#4C5BD4" />
      <path d="M293 172l9 15 9-15z" fill="#ffffff" />
      <circle cx="302" cy="142" r="20" fill="#F5C9A6" />
      <path d="M282 140c0-14 9-22 20-22s20 8 20 22c-5-7-12-9-20-9s-15 2-20 9z" fill="#4A2A86" />
    </ArtFrame>
  );
}

/** ResearchHub's bar fills in a blink and waits; the typical grant crawls the whole loop. */
export function RacingBars() {
  return (
    <div className="flex flex-col gap-3">
      <Lane who="ResearchHub" label="Weeks" labelClassName="text-[#3971ff]">
        <div
          className={cn(
            'h-10 flex-none rounded-[11px] bg-gradient-to-r from-[#5b8dff] to-[#3971ff]',
            styles.barFast
          )}
        />
      </Lane>
      <Lane who="Typical grant" label="9+ months" labelClassName="text-[#b45309]">
        <div
          className={cn(
            'h-10 flex-none rounded-[11px] bg-[repeating-linear-gradient(-45deg,#FFE1C2_0_7px,#FFD3A6_7px_14px)]',
            styles.barSlow
          )}
        />
      </Lane>
    </div>
  );
}

function Lane({
  who,
  label,
  labelClassName,
  children,
}: {
  who: string;
  label: string;
  labelClassName: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-3">
      <span className="text-sm font-semibold text-[#4b5563]">{who}</span>
      <div className="flex h-10 items-center gap-2.5">
        {children}
        <span className={cn('whitespace-nowrap text-base font-bold', labelClassName)}>{label}</span>
      </div>
    </div>
  );
}
