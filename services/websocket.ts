// WebSocket routes
export const WS_ROUTES = {
  NOTE: (orgSlug: string) => `${process.env.NEXT_PUBLIC_WS_URL}${orgSlug}/notebook/`,
  NOTIFICATIONS: (userId: string | number) =>
    `${process.env.NEXT_PUBLIC_WS_URL}notifications/${userId}/`,
  PAPER_SUBMISSION: (userId: string | number) =>
    `${process.env.NEXT_PUBLIC_WS_URL}${userId}/paper_submissions/`,
  CITATION_ENTRY: (userId: string | number) =>
    `${process.env.NEXT_PUBLIC_WS_URL}citation/${userId}/`,
};
