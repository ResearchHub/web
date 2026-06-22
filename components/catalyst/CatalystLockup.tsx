import { Logo } from '@/components/ui/Logo';
import { CATALYST_COLORS } from './catalystTokens';

// 5x7 dot-matrix glyphs for "NYC", rebuilt as live pixels from the Catalyst NYC
// brand extract so the wordmark stays crisp at any size without an image asset.
const GLYPHS: Record<string, readonly string[]> = {
  N: ['10001', '11001', '11001', '10101', '10011', '10011', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
};

const CELL = 3;
const CELL_GAP = 1;

function PixelNYC() {
  return (
    <span style={{ display: 'inline-flex', gap: CELL + 1, alignItems: 'flex-start' }}>
      {'NYC'.split('').map((char, charIndex) => {
        const rows = GLYPHS[char] ?? [];
        return (
          <span
            key={`${char}-${charIndex}`}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(5, ${CELL}px)`,
              gridAutoRows: `${CELL}px`,
              gap: `${CELL_GAP}px`,
            }}
          >
            {rows.flatMap((row, rowIndex) =>
              row.split('').map((bit, colIndex) => (
                <span
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 1,
                    backgroundColor: bit === '1' ? CATALYST_COLORS.accentViolet : 'transparent',
                  }}
                />
              ))
            )}
          </span>
        );
      })}
    </span>
  );
}

interface CatalystLockupProps {
  className?: string;
}

export function CatalystLockup({ className }: CatalystLockupProps) {
  return (
    <div
      role="img"
      aria-label="ResearchHub at Catalyst NYC"
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
    >
      <Logo size={24} />
      <span style={{ width: 1, height: 22, backgroundColor: '#e5e7eb' }} />
      <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 7 }}>
        <span
          style={{
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: CATALYST_COLORS.deepIndigo,
          }}
        >
          Catalyst
        </span>
        <PixelNYC />
      </span>
    </div>
  );
}
