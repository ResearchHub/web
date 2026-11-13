import { cn } from '@/utils/styles';

type StepPicture = 'fund' | 'follow' | 'earn';

const STEPS: { picture: StepPicture; title: string; line: string }[] = [
  {
    picture: 'fund',
    title: 'Fund or get funded',
    line: 'Back a proposal or an RFP pool, or raise money for your own research.',
  },
  {
    picture: 'follow',
    title: 'Follow the funding',
    line: 'Updates and peer reviews show what each dollar paid for.',
  },
  {
    picture: 'earn',
    title: 'Earn rewards',
    line: 'Your endowment earns credits that are free to fund science.',
  },
];

/** ResearchHub in three numbered steps, each with a small drawing. */
export function HowItWorksSteps({ className }: { readonly className?: string }) {
  return (
    <ol className={cn('divide-y divide-gray-100', className)}>
      {STEPS.map((step, index) => (
        <li key={step.picture} className="flex items-center gap-3 py-2.5">
          <span className="relative shrink-0">
            <StepDrawing picture={step.picture} />
            <span
              aria-hidden
              className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white ring-2 ring-white"
            >
              {index + 1}
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5 text-gray-900">
              {step.title}
            </span>
            <span className="mt-0.5 block text-[13px] leading-[18px] text-gray-600">
              {step.line}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

const INK = '#0b1530';
const BLUE = '#3971ff';

function StepDrawing({ picture }: { readonly picture: StepPicture }) {
  return (
    <svg
      aria-hidden
      width="52"
      height="52"
      viewBox="0 0 64 64"
      fill="none"
      stroke={INK}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {picture === 'fund' && (
        <>
          <circle cx="32" cy="32" r="24" stroke="#e3e7ee" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r="24"
            stroke={BLUE}
            strokeWidth="5"
            pathLength="100"
            strokeDasharray="72 100"
            transform="rotate(-90 32 32)"
          />
          <path d="M29 20v7l-6 11c-1 2 .4 4.2 2.6 4.2h12.8c2.2 0 3.6-2.2 2.6-4.2l-6-11v-7" />
          <path d="M27 20h10" />
          <path d="M25.5 36.5c1.7-1 3.4 1 5.1 0s3.4-1 5.1 0 2.4.8 3.3.3" stroke={BLUE} />
          <circle cx="9.4" cy="39.6" r="6" fill="#fde68a" />
          <path d="M9.4 36.8v5.6M6.6 39.6h5.6" stroke="#b45309" strokeWidth="1.8" />
        </>
      )}
      {picture === 'follow' && (
        <>
          <rect x="8" y="18" width="38" height="32" rx="6" />
          <path d="M14 25.5h12" />
          <path d="M14 42l7-6 6 3 9-9" stroke={BLUE} />
          <path
            d="M41 6h14a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5h-7l-4 4v-4h-3a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5z"
            fill="#e0e8ff"
          />
          <path d="M43.5 14h9" />
          <path
            d="M49 40l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8z"
            fill="#fde68a"
          />
        </>
      )}
      {picture === 'earn' && (
        <>
          <path d="M17 44.5v5.5c0 3 6.7 5.5 15 5.5s15-2.5 15-5.5v-5.5" fill="#fde68a" />
          <ellipse cx="32" cy="44.5" rx="15" ry="5.5" fill="#fde68a" />
          <path d="M32 42.5V22" stroke="#047857" />
          <path
            d="M32 33c-7.5 0-11-5.2-11-10.8 6.2 0 11 3.9 11 10.8z"
            stroke="#047857"
            fill="#d1fae5"
          />
          <path
            d="M32 28c0-6.4 4.2-11.2 11-11.2 0 6.3-4.4 11.2-11 11.2z"
            stroke="#047857"
            fill="#d1fae5"
          />
          <path
            d="M50 8l1.6 4.2 4.4 1.6-4.4 1.6L50 19.6l-1.6-4.2-4.4-1.6 4.4-1.6z"
            stroke="#b45309"
            fill="#fde68a"
          />
        </>
      )}
    </svg>
  );
}
