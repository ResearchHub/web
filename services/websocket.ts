// WebSocket routes
export const WS_ROUTES = {
  NOTE: (orgSlug: string) => `${getWebSocketBaseUrl()}${orgSlug}/notebook/`,
  NOTIFICATIONS: (userId: string | number) => `${getWebSocketBaseUrl()}/notifications/${userId}/`,
  NOTEBOOK_CHAT: (noteId: string | number, chatId: string | number) =>
    `${getWebSocketBaseUrl()}/notebook/notes/${noteId}/chats/${chatId}/`,
  NOTE_VERSIONS: (noteId: string | number) => `${getWebSocketBaseUrl()}/notebook/notes/${noteId}/`,
};

function getWebSocketBaseUrl(): string {
  // Deployments set NEXT_PUBLIC_WS_URL explicitly; in local dev it's usually
  // absent, so fall back to the API origin with the scheme swapped to ws(s).
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? deriveWsUrlFromApi();
  return `${wsUrl}/ws`;
}

function deriveWsUrlFromApi(): string | undefined {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return apiUrl?.replace(/^http/, 'ws');
}
