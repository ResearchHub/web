export const CATALYST_NYC_EVENT = {
  route: '/catalyst-nyc',
  eventName: 'Catalyst NYC',
  footer: 'Catalyst NYC promotional event',
  creditAmount: 500,
  yieldRate: 0.561,
  yieldLabel: '56.1% / yr',
  barCount: 11,
  maxYears: 10,
  animationIntervalMs: 900,
  arrival: {
    headline: "We want you to fund science — here's some Funding Credits to get started.",
    cta: 'Claim my $500',
  },
  auth: {
    titleLines: ['Sign-up to', 'claim your $500'] as const,
    emailLabel: 'Your email',
    emailPlaceholder: 'name@institution.com',
    continueLabel: 'Continue',
    loadingLabel: 'Loading...',
    googleLabel: 'Continue with Google',
    noteHighlight: 'same email you registered with',
  },
  loggedIn: {
    titleSuffix: 'is on the way',
    reviewNote:
      'Our team manually reviews each request and will credit your account within 48 hours.',
    eyebrow: 'Signed in as',
    emailNote: "Make sure this is the email you registered with — it's the account we'll credit.",
    continueLabel: 'Explore ResearchHub',
    signOutLabel: 'Not your email? Sign out',
  },
  metadata: {
    title: 'Catalyst NYC — Join ResearchHub',
    description:
      'Catalyst NYC attendees: claim $500 in Funding Credits to fund science. Sign up with the email you registered with.',
  },
} as const;

export function formatCredit(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function formatMoney(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}
