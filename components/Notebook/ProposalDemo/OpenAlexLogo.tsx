interface OpenAlexLogoProps {
  className?: string;
}

// Minimal OpenAlex wordmark stand-in: the circular "OA" mark in its brand
// orange. No official asset ships in the repo, so we render an inline SVG.
export function OpenAlexLogo({ className }: OpenAlexLogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="OpenAlex">
      <circle cx="16" cy="16" r="16" fill="#F5A03D" />
      <text
        x="50%"
        y="53%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="13"
        fontWeight="700"
        fill="#ffffff"
      >
        oa
      </text>
    </svg>
  );
}
