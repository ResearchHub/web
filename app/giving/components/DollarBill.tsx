/**
 * Engraved-style one dollar bill: the real note's layout (seals, serials, corner rosettes,
 * guilloche) and a faceted portrait of Washington. Purely decorative.
 */

const SERIF = "'Times New Roman',Times,'Liberation Serif','Nimbus Roman',serif";

/** Washington as low-poly facets, back to front, lit from the left. */
const PORTRAIT: [points: string, fill: string][] = [
  [
    '139,110.4 139,102.3 150.2,97.4 163.2,94.9 179.3,92.4 188.6,88.1 196.7,91.8 201,96.8 201,110.4',
    '#1d231e',
  ],
  ['139,102.3 150.2,97.4 158.2,97.1 152.6,110.4 139,110.4', '#353d34'],
  ['179.3,92.4 188.6,88.1 196.7,91.8 200.4,96.8 185.5,98.6', '#353d34'],
  ['185.5,98.6 200.4,96.8 201,110.4 182.4,110.4', '#1d231e'],
  ['173.7,99.2 185.5,97.4 181.8,110.4 176.8,110.4', '#353d34'],
  ['158.1,53.1 157.4,50.5 159.6,47.3 165.4,48.6 164.7,52.8', '#f3f4ec'],
  ['159.6,47.3 164,44.7 165.4,48.6', '#f3f4ec'],
  ['164,44.7 170.6,43.1 173.5,46.3 165.4,48.6', '#f3f4ec'],
  ['170.6,43.1 177.9,43.1 173.5,46.3', '#f3f4ec'],
  ['177.9,43.1 184.5,44.4 180.8,48.3 173.5,46.3', '#dfe2d5'],
  ['184.5,44.4 189.6,47.6 185.9,53.1 180.8,48.3', '#c3c9b8'],
  ['165.4,48.6 173.5,46.3 177.9,54.4 170.6,54.8 164.7,52.8', '#f3f4ec'],
  ['173.5,46.3 180.8,48.3 177.9,54.4', '#c3c9b8'],
  ['180.8,48.3 185.9,53.1 185.9,60.3 177.9,54.4', '#c3c9b8'],
  ['170.6,54.8 177.9,54.4 174.2,59.7', '#dfe2d5'],
  ['177.9,54.4 185.9,60.3 182.3,66.2 175.7,65.5 174.2,59.7', '#c3c9b8'],
  ['189.6,47.6 192.5,52.2 194,58.4 185.9,60.3 185.9,53.1', '#9ea594'],
  ['185.9,60.3 194,58.4 193.6,64.9 188.8,68.8 182.3,66.2', '#9ea594'],
  ['175.7,65.5 182.3,66.2 177.1,68.1', '#c3c9b8'],
  ['182.3,66.2 188.8,68.8 193.6,64.9 192.5,71.4 189.6,78.5 184.5,81.8 180.8,75.9', '#7a8273'],
  [
    '159.6,92.9 167.6,92.9 176.8,88.3 178.6,83.1 181.5,83.1 183.7,86.3 183,94.8 163.2,96.8',
    '#7a8273',
  ],
  ['159.6,92.9 167.6,92.9 169.1,96.8 163.2,96.8', '#9ea594'],
  ['178.1,88.1 185.5,84.4 189.8,88.7 183,95.5 178.7,94.9', '#353d34'],
  ['163.8,93.7 170,92.1 178.7,90.2 180.5,94.3 173.1,96.5 164.4,96.8', '#dfe2d5'],
  ['170,92.1 178.7,90.2 180.5,94.3 173.1,96.5', '#c3c9b8'],
  [
    '165.7,96.5 172.5,96.1 174.3,98.9 172.8,101.1 173.7,103.6 170.9,107 167.2,106.4 165.7,103.3 164.4,99.9',
    '#f3f4ec',
  ],
  ['172.5,96.1 174.3,98.9 172.8,101.1 173.7,103.6 170.9,107 170.6,101.7', '#c3c9b8'],
  ['165.7,96.5 169.1,98.6 168.1,103 165.7,103.3 164.4,99.9', '#dfe2d5'],
  ['167.2,106.4 170.9,107 169.4,104.2', '#c3c9b8'],
  ['158.1,53.1 164.7,52.8 162.5,57', '#dfe2d5'],
  ['164.7,52.8 170.6,54.8 168.4,59 162.5,57', '#c3c9b8'],
  ['170.6,54.8 174.2,59.7 172.8,62.3 168.4,59', '#9ea594'],
  ['158.1,53.1 162.5,57 162.5,62.3 156.3,59.7', '#dfe2d5'],
  ['162.5,57 168.4,59 162.5,62.3', '#c3c9b8'],
  ['156.3,59.7 162.5,62.3 162.5,65.5 159.9,66.5 155.9,65.2', '#dfe2d5'],
  ['162.5,62.3 168.4,59 166.9,64.9 162.5,65.5', '#dfe2d5'],
  ['168.4,59 172.8,62.3 171.7,65.8 166.9,64.9', '#9ea594'],
  ['172.8,62.3 174.2,59.7 175.7,65.5 174.9,69.4 171.7,65.8', '#9ea594'],
  ['162.5,65.5 166.9,64.9 171.7,65.8 170.2,68.9 166.5,67.6 162.9,68.8', '#9ea594'],
  ['159.9,66.5 162.5,65.5 162.9,68.8 162.1,68.4 160.3,68.1', '#c3c9b8'],
  ['155.9,65.2 159.9,66.5 160.3,68.1 157,67.8', '#9ea594'],
  ['157,67.8 160.3,68.1 158.5,72.3 155.9,71', '#dfe2d5'],
  ['157,68.3 159.8,68.1 159.9,69.4 157.4,69.4', '#555e51'],
  ['157.8,68.6 159.2,68.5 159.1,69.2', '#1d231e'],
  ['162.9,68.8 166.5,67.6 170.2,68.9 166.5,70', '#dfe2d5'],
  ['165.3,68.1 167.4,68.1 167.3,69.7 165.4,69.7', '#353d34'],
  ['162.9,68.8 166.5,67.3 170.2,68.9 166.5,68.2', '#1d231e'],
  ['160.3,68.1 162.1,68.4 160.7,73 158.5,72.3', '#f3f4ec'],
  ['158.5,72.3 160.7,73 156.3,76.6 153.4,76.9', '#f3f4ec'],
  ['155.9,71 158.5,72.3 153.4,76.9 156.7,74.6', '#dfe2d5'],
  ['153.4,76.9 156.3,76.6 154.8,79.2', '#c3c9b8'],
  ['156.3,76.6 160.3,77.9 157.4,79.5 154.8,79.2', '#9ea594'],
  ['155.6,78.7 158.1,78.4 157.4,79.5', '#1d231e'],
  ['162.1,68.4 163.2,72.7 160.7,73', '#c3c9b8'],
  ['160.7,73 163.2,72.7 163.2,75.9 160.3,77.9 156.3,76.6', '#c3c9b8'],
  ['163.2,75.9 162.5,78.9 160.3,77.9', '#9ea594'],
  ['160.3,77.9 162.5,78.9 164.7,80.2 157.4,79.5', '#9ea594'],
  ['163.2,72.7 162.9,68.8 166.5,70 167.6,75.6', '#dfe2d5'],
  ['166.5,70 170.2,68.9 172,72.3 167.6,75.6', '#c3c9b8'],
  ['171.7,65.8 174.9,69.4 172,72.3 170.2,68.9', '#7a8273'],
  ['163.2,72.7 167.6,75.6 164.7,80.2 162.5,78.9 163.2,75.9', '#c3c9b8'],
  ['167.6,75.6 172,72.3 174.2,77.2 164.7,80.2', '#c3c9b8'],
  ['164.7,80.2 174.2,77.2 167.6,86', '#9ea594'],
  ['174.9,69.4 177.1,68.1 177.1,72.7 176.8,77.9 174.2,77.2 172,72.3', '#7a8273'],
  ['174.2,77.2 176.8,77.9 178.6,83.1 176.8,88.3', '#555e51'],
  ['174.2,77.2 176.8,88.3 171.3,89.9 167.6,86', '#9ea594'],
  ['157.4,79.5 164.7,80.2 164.7,83.7 162.5,82.4 160.3,81.8 157,81.8', '#dfe2d5'],
  ['157,81.8 160.3,81.8 162.5,82.4 164.7,83.7 160.3,83.3 157.4,83.4', '#c3c9b8'],
  ['157.4,83.4 160.3,83.3 164.7,83.7 161.8,84.7 160.3,85.4 157,85', '#dfe2d5'],
  ['157,85 160.3,85.4 161.8,84.7 164.7,83.7 163.2,86.7 157.8,87.3', '#9ea594'],
  ['164.7,83.7 167.6,86 161,88.3 163.2,86.7', '#c3c9b8'],
  ['157.8,87.3 163.2,86.7 161,88.3 164.7,90.6 156.7,89.6', '#dfe2d5'],
  ['161,88.3 167.6,86 171.3,89.9 164.7,90.6', '#9ea594'],
  ['156.7,89.6 164.7,90.6 167.6,92.9 159.6,92.9', '#9ea594'],
  ['164.7,90.6 171.3,89.9 176.8,88.3 167.6,92.9', '#7a8273'],
  ['177.1,72.7 180.8,73.3 181.9,77.9 176.8,77.9', '#9ea594'],
  ['176.8,77.9 181.9,77.9 180.4,82.4 178.2,83.4 178.6,83.1', '#c3c9b8'],
  ['178.2,75.3 180.1,75.6 179.7,79.5 177.9,78.9', '#555e51'],
  ['177.9,66.5 183,64.5 188.8,65.5 191,67.8 183.7,67.5', '#f3f4ec'],
  ['177.9,66.5 183.7,67.5 191,67.8 188.8,70.4 179.3,70.4', '#dfe2d5'],
  ['179.3,70.4 188.8,70.4 191,67.8 190.3,70.7 185.2,72.3 179.3,72', '#9ea594'],
  ['176.8,66.8 179,66.3 180.4,68.4 179.3,70.6 177.1,70.4 176,68.4', '#c3c9b8'],
  ['178.6,72.7 183.7,70.7 189.6,71.7 191.8,74 184.5,73.6', '#f3f4ec'],
  ['178.6,72.7 184.5,73.6 191.8,74 189.6,76.6 180.1,76.6', '#dfe2d5'],
  ['180.1,76.6 189.6,76.6 191.8,74 191,76.9 185.9,78.5 180.1,78.2', '#9ea594'],
  ['177.5,73 179.7,72.5 181.2,74.6 180.1,76.7 177.9,76.6 176.8,74.6', '#c3c9b8'],
];

/** `id` prefixes the SVG's pattern and clip ids, so two bills can share a page. */
export function DollarBill({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 340 145" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}-paper`} cx="50%" cy="48%" r="65%">
          <stop offset="0" stopColor="#e6e8d9" />
          <stop offset="1" stopColor="#d6dbc4" />
        </radialGradient>
        <pattern id={`${id}-mesh`} width="3" height="3" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#e6e8d9" strokeWidth=".32">
            <circle cx="1.5" cy="1.5" r="1.5" />
            <circle r="1.5" />
            <circle cx="3" r="1.5" />
            <circle cy="3" r="1.5" />
            <circle cx="3" cy="3" r="1.5" />
          </g>
        </pattern>
        <pattern id={`${id}-braid`} width="8" height="5" patternUnits="userSpaceOnUse">
          <path
            d="M0 2.5q2-2.4 4 0t4 0M0 2.5q2 2.4 4 0t4 0"
            fill="none"
            stroke="#c3cab2"
            strokeWidth=".3"
          />
        </pattern>
        <pattern id={`${id}-lines`} width="2" height="1.1" patternUnits="userSpaceOnUse">
          <path d="M0 .55H2" stroke="#26302a" strokeWidth=".45" />
        </pattern>
        <clipPath id={`${id}-oval`}>
          <ellipse cx="170" cy="73" rx="31" ry="37" />
        </clipPath>
      </defs>
      <rect width="340" height="145" rx="3" fill={`url(#${id}-paper)`} />
      <rect x="10.5" y="10.5" width="319" height="124" fill={`url(#${id}-braid)`} />
      <path d="M4.5 4.5h331v136h-331zM10.5 10.5v124h319v-124z" fill="#4c5a50" fillRule="evenodd" />
      <path
        d="M4.5 4.5h331v136h-331zM10.5 10.5v124h319v-124z"
        fill={`url(#${id}-mesh)`}
        fillRule="evenodd"
      />
      <g fill="none" stroke="#25302a">
        <rect x="4.5" y="4.5" width="331" height="136" strokeWidth=".9" />
        <rect x="10.5" y="10.5" width="319" height="124" strokeWidth=".7" />
        <rect x="12.5" y="12.5" width="315" height="120" strokeWidth=".3" />
      </g>
      <circle
        cx="84"
        cy="76"
        r="25"
        fill="none"
        stroke="#c3cab2"
        strokeWidth="7"
        strokeDasharray=".3 .55"
      />
      <circle cx="84" cy="76" r="28.8" fill="none" stroke="#c3cab2" strokeWidth=".5" />
      <circle
        cx="256"
        cy="76"
        r="25"
        fill="none"
        stroke="#c3cab2"
        strokeWidth="7"
        strokeDasharray=".3 .55"
      />
      <circle cx="256" cy="76" r="28.8" fill="none" stroke="#c3cab2" strokeWidth=".5" />
      <rect
        x="135"
        y="5.6"
        width="70"
        height="3.8"
        rx="1.9"
        fill="#e6e8d9"
        stroke="#25302a"
        strokeWidth=".35"
      />
      <text
        x="170.45"
        y="8.65"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="3.1"
        letterSpacing=".9"
        fill="#25302a"
      >
        FEDERAL RESERVE NOTE
      </text>
      <text
        x="170.6"
        y="27"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="10"
        fontWeight="700"
        letterSpacing="1.25"
        fill="#25302a"
        style={{ fontVariantNumeric: 'lining-nums' }}
      >
        THE UNITED STATES OF AMERICA
      </text>
      <circle
        cx="26"
        cy="26"
        r="14.6"
        fill="none"
        stroke="#25302a"
        strokeWidth="1.3"
        strokeDasharray="0 2.29"
        strokeLinecap="round"
      />
      <circle cx="26" cy="26" r="13.4" fill="#e6e8d9" stroke="#25302a" strokeWidth=".8" />
      <circle
        cx="26"
        cy="26"
        r="11.9"
        fill="none"
        stroke="#25302a"
        strokeWidth="2.2"
        strokeDasharray=".32 .5"
      />
      <circle cx="26" cy="26" r="10.5" fill="#e6e8d9" stroke="#25302a" strokeWidth=".5" />
      <path
        transform="translate(26 26) scale(1.05)"
        d="M.6-7H1.6V5.4L4.3 6.1V7H-4.1V6.1L-1.4 5.4V-4.2L-4 -3L-4.3 -3.7Z"
        fill="#25302a"
      />
      <circle
        cx="314"
        cy="26"
        r="14.6"
        fill="none"
        stroke="#25302a"
        strokeWidth="1.3"
        strokeDasharray="0 2.29"
        strokeLinecap="round"
      />
      <circle cx="314" cy="26" r="13.4" fill="#e6e8d9" stroke="#25302a" strokeWidth=".8" />
      <circle
        cx="314"
        cy="26"
        r="11.9"
        fill="none"
        stroke="#25302a"
        strokeWidth="2.2"
        strokeDasharray=".32 .5"
      />
      <circle cx="314" cy="26" r="10.5" fill="#e6e8d9" stroke="#25302a" strokeWidth=".5" />
      <path
        transform="translate(314 26) scale(1.05)"
        d="M.6-7H1.6V5.4L4.3 6.1V7H-4.1V6.1L-1.4 5.4V-4.2L-4 -3L-4.3 -3.7Z"
        fill="#25302a"
      />
      <circle
        cx="26"
        cy="119"
        r="14.6"
        fill="none"
        stroke="#25302a"
        strokeWidth="1.3"
        strokeDasharray="0 2.29"
        strokeLinecap="round"
      />
      <circle cx="26" cy="119" r="13.4" fill="#e6e8d9" stroke="#25302a" strokeWidth=".8" />
      <circle
        cx="26"
        cy="119"
        r="11.9"
        fill="none"
        stroke="#25302a"
        strokeWidth="2.2"
        strokeDasharray=".32 .5"
      />
      <circle cx="26" cy="119" r="10.5" fill="#e6e8d9" stroke="#25302a" strokeWidth=".5" />
      <path
        transform="translate(26 119) scale(1.05)"
        d="M.6-7H1.6V5.4L4.3 6.1V7H-4.1V6.1L-1.4 5.4V-4.2L-4 -3L-4.3 -3.7Z"
        fill="#25302a"
      />
      <circle
        cx="314"
        cy="119"
        r="14.6"
        fill="none"
        stroke="#25302a"
        strokeWidth="1.3"
        strokeDasharray="0 2.29"
        strokeLinecap="round"
      />
      <circle cx="314" cy="119" r="13.4" fill="#e6e8d9" stroke="#25302a" strokeWidth=".8" />
      <circle
        cx="314"
        cy="119"
        r="11.9"
        fill="none"
        stroke="#25302a"
        strokeWidth="2.2"
        strokeDasharray=".32 .5"
      />
      <circle cx="314" cy="119" r="10.5" fill="#e6e8d9" stroke="#25302a" strokeWidth=".5" />
      <path
        transform="translate(314 119) scale(1.05)"
        d="M.6-7H1.6V5.4L4.3 6.1V7H-4.1V6.1L-1.4 5.4V-4.2L-4 -3L-4.3 -3.7Z"
        fill="#25302a"
      />
      <polygon
        points="84,60.6 85,62.6 86.2,60.8 86.8,62.9 88.3,61.2 88.7,63.4 90.4,62 90.4,64.2 92.3,63 92,65.3 94.1,64.4 93.5,66.5 95.6,65.9 94.7,68 97,67.7 95.8,69.6 98,69.6 96.6,71.3 98.8,71.7 97.1,73.2 99.2,73.8 97.4,75 99.4,76 97.4,77 99.2,78.2 97.1,78.8 98.8,80.3 96.6,80.7 98,82.4 95.8,82.4 97,84.3 94.7,84 95.6,86.1 93.5,85.5 94.1,87.6 92,86.7 92.3,89 90.4,87.8 90.4,90 88.7,88.6 88.3,90.8 86.8,89.1 86.2,91.2 85,89.4 84,91.4 83,89.4 81.8,91.2 81.2,89.1 79.7,90.8 79.3,88.6 77.6,90 77.6,87.8 75.7,89 76,86.7 73.9,87.6 74.5,85.5 72.4,86.1 73.3,84 71,84.3 72.2,82.4 70,82.4 71.4,80.7 69.2,80.3 70.9,78.8 68.8,78.2 70.6,77 68.6,76 70.6,75 68.8,73.8 70.9,73.2 69.2,71.7 71.4,71.3 70,69.6 72.2,69.6 71,67.7 73.3,68 72.4,65.9 74.5,66.5 73.9,64.4 76,65.3 75.7,63 77.6,64.2 77.6,62 79.3,63.4 79.7,61.2 81.2,62.9 81.8,60.8 83,62.6"
        fill="#25302a"
      />
      <circle cx="84" cy="76" r="12.7" fill="#e6e8d9" />
      <circle
        cx="84"
        cy="76"
        r="10.7"
        fill="none"
        stroke="#25302a"
        strokeWidth="2.1"
        strokeDasharray=".9 .35 .6 .35 1.1 .35 .7 .9"
      />
      <circle cx="84" cy="76" r="8.6" fill="none" stroke="#25302a" strokeWidth=".55" />
      <text
        x="84"
        y="80.4"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="13"
        fontWeight="700"
        fill="#25302a"
      >
        B
      </text>
      <polygon
        points="256,60.6 257.3,63.2 259.2,60.9 260,63.7 262.3,61.9 262.4,64.8 265.1,63.5 264.6,66.4 267.4,65.7 266.4,68.4 269.3,68.3 267.8,70.8 270.6,71.2 268.6,73.3 271.3,74.4 268.9,76 271.3,77.6 268.6,78.7 270.6,80.8 267.8,81.2 269.3,83.7 266.4,83.6 267.4,86.3 264.6,85.6 265.1,88.5 262.4,87.2 262.3,90.1 260,88.3 259.2,91.1 257.3,88.8 256,91.4 254.7,88.8 252.8,91.1 252,88.3 249.7,90.1 249.6,87.2 246.9,88.5 247.4,85.6 244.6,86.3 245.6,83.6 242.7,83.7 244.2,81.2 241.4,80.8 243.4,78.7 240.7,77.6 243.1,76 240.7,74.4 243.4,73.3 241.4,71.2 244.2,70.8 242.7,68.3 245.6,68.4 244.6,65.7 247.4,66.4 246.9,63.5 249.6,64.8 249.7,61.9 252,63.7 252.8,60.9 254.7,63.2"
        fill="#3d7a55"
      />
      <circle cx="256" cy="76" r="12.4" fill="#e6e8d9" />
      <circle
        cx="256"
        cy="76"
        r="10.5"
        fill="none"
        stroke="#3d7a55"
        strokeWidth="2"
        strokeDasharray=".8 .35 .6 .35 1 .35 .7 .9"
      />
      <circle cx="256" cy="76" r="8.5" fill="none" stroke="#3d7a55" strokeWidth=".5" />
      <g fill="none" stroke="#3d7a55" strokeWidth=".5">
        <path d="M250.5 69.5h11v5.5q0 4.6-5.5 7.3q-5.5-2.7-5.5-7.3z" />
        <path
          d="M253 71.2h6M256 70.3v1.6M253 71.2l-.9 1.6h1.8zM259 71.2l-.9 1.6h1.8z"
          strokeWidth=".35"
        />
        <circle cx="256" cy="78.6" r=".8" strokeWidth=".4" />
        <path d="M256 79.4v2M256 80.6h.9" strokeWidth=".4" />
      </g>
      <path d="M250.5 76.6l5.5-3.4 5.5 3.4v1.4l-5.5-3.4-5.5 3.4z" fill="#3d7a55" />
      <text
        x="84.27"
        y="52.5"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="6.6"
        letterSpacing=".55"
        fill="#3d7a55"
        style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}
      >
        RB 12012026 H
      </text>
      <text
        x="256.27"
        y="104.5"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="6.6"
        letterSpacing=".55"
        fill="#3d7a55"
        style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}
      >
        RB 12012026 H
      </text>
      <text
        x="119"
        y="106"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="2.9"
        letterSpacing=".3"
        fill="#25302a"
      >
        SERIES
      </text>
      <text
        x="119"
        y="109.6"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="2.9"
        letterSpacing=".3"
        fill="#25302a"
        style={{ fontVariantNumeric: 'lining-nums' }}
      >
        2026
      </text>
      <g fill="none" stroke="#25302a" strokeWidth=".45" strokeLinecap="round">
        <path d="M70 104.5c2-3 3 1 4.5-1.5s1.5 1.6 3 0 2-2 2.8.2 2 .4 3.2-1 1 1.4 2.6.3" />
        <path d="M240 112.5c1.5-2.6 2.6 1.2 4-1.3s2 1.8 3.4 0 1.6-1.6 2.6 0 2.4-.2 3.5-1" />
      </g>
      <path d="M66 107.6h22M236 115.6h22" stroke="#25302a" strokeWidth=".25" />
      <path
        d="M113 121.3h114l-4.5 5.2 4.5 5.2h-114l4.5-5.2z"
        fill="#e6e8d9"
        stroke="#25302a"
        strokeWidth=".5"
      />
      <text
        x="171.4"
        y="130.2"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="10.5"
        fontWeight="700"
        letterSpacing="2.8"
        fill="#25302a"
      >
        ONE DOLLAR
      </text>
      <g clipPath={`url(#${id}-oval)`}>
        <rect x="138" y="35" width="64" height="76" fill="#56635a" />
        <rect x="138" y="35" width="64" height="76" fill={`url(#${id}-lines)`} opacity=".55" />
        {PORTRAIT.map(([points, fill]) => (
          <polygon key={points} points={points} fill={fill} />
        ))}
        <path
          d="M157.4 83.4 L160.3 83.3 L164.7 83.7"
          fill="none"
          stroke="#1d231e"
          strokeWidth="0.45"
          strokeLinecap="round"
        />
        <path
          d="M162.5 78.9 L164.7 80.2 L166.9 85"
          fill="none"
          stroke="#7a8273"
          strokeWidth="0.35"
          strokeLinecap="round"
        />
        <path
          d="M163.6 68 L166.5 67 L169.5 68.1"
          fill="none"
          stroke="#555e51"
          strokeWidth="0.3"
          strokeLinecap="round"
        />
        <path
          d="M158.1 53.1 L164.7 52.8 L170.6 54.8 L174.2 59.7 L175.7 65.5 L177.1 68.1"
          fill="none"
          stroke="#7a8273"
          strokeWidth="0.45"
          strokeLinecap="round"
        />
        <path
          d="M162.5 65.5 L166.9 64.9 L171.7 65.8"
          fill="none"
          stroke="#555e51"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        <path
          d="M179.2 67.8 L177.9 67.6 L177.3 68.6 L178.1 69.4 L179.2 69.1"
          fill="none"
          stroke="#7a8273"
          strokeWidth="0.3"
          strokeLinecap="round"
        />
        <path
          d="M179.9 74 L178.6 73.8 L178.1 74.8 L178.8 75.6 L179.9 75.3"
          fill="none"
          stroke="#7a8273"
          strokeWidth="0.3"
          strokeLinecap="round"
        />
        <path
          d="M155.9 65.7 L158.1 65.2"
          fill="none"
          stroke="#555e51"
          strokeWidth="0.45"
          strokeLinecap="round"
        />
        <path
          d="M159.6 50.5 L166.9 47.3 L177.1 46"
          fill="none"
          stroke="#c3c9b8"
          strokeWidth="0.3"
          strokeLinecap="round"
        />
        <path
          d="M163.2 51.8 L172 49.2 L182.3 49.9"
          fill="none"
          stroke="#c3c9b8"
          strokeWidth="0.3"
          strokeLinecap="round"
        />
        <path
          d="M167.6 53.1 L177.1 51.2 L187.4 53.8"
          fill="none"
          stroke="#9ea594"
          strokeWidth="0.3"
          strokeLinecap="round"
        />
        <path
          d="M172 57 L180.8 57.7 L189.6 61"
          fill="none"
          stroke="#7a8273"
          strokeWidth="0.3"
          strokeLinecap="round"
        />
      </g>
      <ellipse
        cx="170"
        cy="73"
        rx="32.6"
        ry="38.6"
        fill="none"
        stroke="#25302a"
        strokeWidth="2.6"
        strokeDasharray=".3 .45"
      />
      <ellipse cx="170" cy="73" rx="31" ry="37" fill="none" stroke="#25302a" strokeWidth=".9" />
      <ellipse cx="170" cy="73" rx="34.3" ry="40.3" fill="none" stroke="#25302a" strokeWidth=".6" />
      <rect
        x="156"
        y="111.3"
        width="28"
        height="4.6"
        rx="1"
        fill="#e6e8d9"
        stroke="#25302a"
        strokeWidth=".4"
      />
      <text
        x="170.35"
        y="114.75"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize="3.3"
        letterSpacing=".7"
        fill="#25302a"
      >
        WASHINGTON
      </text>
    </svg>
  );
}
