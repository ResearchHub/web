/**
 * Whether the app is running against production: on the client by hostname,
 * on the server by Vercel's environment.
 */
export function isProduction(): boolean {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return (
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.includes('staging') &&
      !hostname.includes('preview') &&
      !hostname.includes('vercel')
    );
  }

  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;
  return (
    vercelEnv === 'production' ||
    (nodeEnv === 'production' && vercelEnv !== 'preview' && vercelEnv !== 'development')
  );
}
