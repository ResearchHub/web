const getBaseUrl = (): string => {
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://proxy.prod.researchhub.com';
  }
  return 'https://proxy.staging.researchhub.com';
};

export const ProxyService = {
  getBaseUrl,
  generateProxyUrl: (url: string): string => {
    // Don't proxy ResearchHub CDN URLs
    if (url && url.includes('researchhub')) {
      return url;
    }

    const baseUrl = getBaseUrl();
    return `${baseUrl}/proxy?url=${encodeURIComponent(url)}`;
  },
};

export default ProxyService;
