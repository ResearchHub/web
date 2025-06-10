// WebSocket routes
export const WS_ROUTES = {
  NOTE: (orgSlug: string) => `${process.env.NEXT_PUBLIC_API_URL}${orgSlug}/notebook/`,
  NOTIFICATIONS: (userId: string | number) => `${getWebSocketBaseUrl()}/notifications/${userId}/`,
  PAPER_SUBMISSION: (userId: string | number) =>
    `${getWebSocketBaseUrl()}/${userId}/paper_submissions/`,
  CITATION_ENTRY: (userId: string | number) => `${getWebSocketBaseUrl()}/citation/${userId}/`,
};

function getWebSocketBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_WS_URL;
  return `${apiUrl}/ws`;
}
