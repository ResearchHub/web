/* The tower -------------------------------------------------------------------- */

/** One stack of papers in the tower: a block whose face is ruled into sheets. */
function Block({
  x,
  y,
  w,
  h,
  className,
  bad,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  className?: string;
  bad?: boolean;
}) {
  return (
    <rect
      className={className}
      x={x}
      y={y}
      width={w}
      height={h}
      rx={1.5}
      fill={bad ? 'var(--a-red)' : 'url(#audit-sheets)'}
      stroke="var(--a-ink)"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );
}

/**
 * Later work stands on earlier papers. A tower of paper stacks rests on two
 * supports, one of them a single small paper nobody re-checked (red). Where
 * motion is welcome that paper slips out and what stood on it comes down,
 * on a slow loop (audit.css); otherwise the tower simply stands on it.
 */
export function Tower() {
  return (
    <figure className="mx-auto w-full max-w-[440px]">
      <svg
        viewBox="-34 60 404 334"
        className="a-tw block h-auto w-full overflow-visible"
        role="img"
      >
        <title>
          A tall tower of paper stacks resting partly on one small red paper. The red paper slips
          out and the tower above it falls.
        </title>
        <defs>
          <pattern id="audit-sheets" width="8" height="5" patternUnits="userSpaceOnUse">
            <rect width="8" height="5" fill="var(--a-sheet)" />
            <path d="M0 4.5H8" stroke="var(--a-ink)" strokeWidth="0.8" opacity="0.2" />
          </pattern>
        </defs>

        <path
          d="M-30 380H366"
          stroke="var(--a-ink)"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* The sound support. */}
        <Block x={180} y={340} w={120} h={40} />

        {/* Everything built on top: tips over the sound support's corner. */}
        <g className="a-tw-up">
          <Block x={84} y={312} w={226} h={28} />
          <Block x={96} y={232} w={64} h={80} />
          <Block x={206} y={252} w={90} h={60} />
          <Block x={216} y={232} w={60} h={20} />
          <Block x={90} y={208} w={200} h={24} />
          <Block x={110} y={176} w={30} h={32} />
          <Block x={150} y={118} w={76} h={90} />
        </g>

        {/* Two loose stacks at the very top, thrown clear as it goes. */}
        <Block className="a-tw-loose a-tw-loose-1" x={160} y={92} w={40} h={26} />
        <Block className="a-tw-loose a-tw-loose-2" x={206} y={100} w={24} h={18} />

        {/* The one paper that does not hold. */}
        <Block className="a-tw-bad" x={104} y={340} w={30} h={40} bad />
      </svg>
      <figcaption className="mt-5 flex items-start gap-3 text-[14px] leading-[1.5] text-[var(--a-soft)]">
        <span aria-hidden className="mt-[5px] h-3 w-3 shrink-0 bg-[var(--a-red)]" />
        Research is built on earlier papers. When one near the bottom is wrong, so is what stands on
        it.
      </figcaption>
    </figure>
  );
}
