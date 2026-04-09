// WebSocket routes
export const WS_ROUTES = {
  NOTE: (orgSlug: string) => `${getWebSocketBaseUrl()}${orgSlug}/notebook/`,
  NOTIFICATIONS: (userId: string | number) => `${getWebSocketBaseUrl()}/notifications/${userId}/`,
  CITATION_ENTRY: (userId: string | number) => `${getWebSocketBaseUrl()}/citation/${userId}/`,
};

function getWebSocketBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_WS_URL;
  return `${apiUrl}/ws`;
}
