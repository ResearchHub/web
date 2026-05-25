import AiExtension from '@tiptap-pro/extension-ai';

// Account-wide Tiptap Cloud App ID. The same value is used by Content AI,
// Convert, and Collab — each product has its own JWT secret, but they all
// authenticate against the same account-scoped App ID.
const TIPTAP_AI_APP_ID = process.env.NEXT_PUBLIC_TIPTAP_APP_ID;
const TIPTAP_AI_BASE_URL =
  process.env.NEXT_PUBLIC_TIPTAP_AI_BASE_URL || 'https://api.tiptap.dev/v1/ai';

export type { AiStorage, Language } from '@tiptap-pro/extension-ai';
export { tryParseToTiptapHTML } from '@tiptap-pro/extension-ai';
export const Ai = AiExtension.configure({
  appId: TIPTAP_AI_APP_ID,
  baseUrl: TIPTAP_AI_BASE_URL,
  autocompletion: true,
});
