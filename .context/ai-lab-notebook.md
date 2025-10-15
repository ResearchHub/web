# Frontend AI Lab Notebook Integration

## Overview

Build frontend components for AI-assisted academic writing with tab completion, agentic chat with citations, and freemium usage tracking. Backend API is ready; Stripe integration optional for initial development.

## Backend API Summary

**Base URL:** `/api/` (all endpoints relative to backend)

**Auth:** `Authorization: Token YOUR_AUTH_TOKEN` header required

### Core Endpoints

**Tab Completion (SSE Stream):**

```
POST /api/note/{note_id}/ai/complete
Body: { "context": "text before cursor", "cursor_position": 123 }
Returns: Server-Sent Events stream with completion deltas
```

**AI Chat (SSE Stream):**

```
POST /api/note/{note_id}/ai/chat
Body: { "message": "Find papers about...", "conversation_id": 123 }
Returns: SSE stream with response + tool calls (citation search)
```

**Conversations:**

```
GET /api/ai/conversation?note_id={id}  - List conversations for note
GET /api/ai/conversation/{id}          - Get conversation with messages
DELETE /api/ai/conversation/{id}       - Delete conversation
```

**Usage & Subscription:**

```
GET /api/ai/usage                      - Get daily quota usage
POST /api/ai/completion/accept         - Mark completion as accepted
GET /api/ai/subscription               - Get subscription details
POST /api/ai/subscription/create       - Create Stripe checkout (needs Stripe)
DELETE /api/ai/subscription/cancel     - Cancel subscription
```

### SSE Response Format

Both completion and chat endpoints stream in SSE format:

```
event: chunk
data: {"type": "text", "content": "Hello"}

event: chunk
data: {"type": "tool_call", "tool_name": "search_papers", "arguments": {...}}

event: chunk
data: {"type": "tool_result", "tool_name": "search_papers", "result": [...]}

event: done
data: {"conversation_id": 123, "message_id": 456, "completion_log_id": 789}

event: error
data: {"error": "Quota exceeded", "quota_exceeded": true}
```

## Implementation Plan

### 1. API Client Utilities

**File:** `src/utils/ai/apiClient.ts`

Create helper functions:

- `fetchWithSSE(url, body, onChunk)` - SSE stream handler
- `parseSSEEvent(event)` - Parse SSE format
- Handle auth headers and error responses

### 2. React Hooks

**File:** `src/hooks/ai/useAICompletion.ts`

Hook for tab completions:

- Debounced trigger (1 second after typing stops)
- Stream completion deltas
- Return `{ getCompletion, isLoading, completion, error, accept, reject }`
- Handle 429 quota errors gracefully

**File:** `src/hooks/ai/useAIChat.ts`

Hook for AI chat:

- Send messages with SSE streaming
- Maintain conversation state
- Load conversation history
- Return `{ sendMessage, messages, isLoading, error, conversationId }`

**File:** `src/hooks/ai/useAIUsage.ts`

Hook for usage stats:

- Fetch current daily usage
- Return `{ usage, limits, percentageUsed, isLoading, refetch }`
- Poll every 30s when panel is open

**File:** `src/hooks/ai/useAISubscription.ts`

Hook for subscription:

- Get subscription plan/limits
- Create checkout session (optional - Stripe needed)
- Cancel subscription
- Return `{ subscription, isLoading, createCheckout, cancel }`

### 3. TipTap Extension

**File:** `src/components/LabNotebook/extensions/AICompletionExtension.ts`

TipTap extension for ghost text completions:

- Create ProseMirror decoration for inline gray text
- Key bindings: `Tab` to accept, `Escape` to reject
- Plugin state to track active completion
- Non-intrusive styling (opacity: 0.5, italic)

Key implementation:

```typescript
export const AICompletionExtension = Extension.create({
  name: 'aiCompletion',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('aiCompletion'),
        state: {
          init: () => ({ completion: null, pos: null }),
          apply: (tr, value) => {
            /* ... */
          },
        },
        props: {
          decorations: (state) => {
            /* render ghost text */
          },
          handleKeyDown: (view, event) => {
            if (event.key === 'Tab') {
              /* accept */
            }
            if (event.key === 'Escape') {
              /* reject */
            }
          },
        },
      }),
    ];
  },
});
```

### 4. UI Components

**File:** `src/components/LabNotebook/AICompletionOverlay.tsx`

Behavioral component for managing completions:

- Listen to editor `onUpdate` event
- Debounce 1 second after typing
- Extract context (last 200 chars before cursor)
- Call `useAICompletion` hook
- Update TipTap extension with completion
- No visual rendering (uses TipTap decorations)

**File:** `src/components/LabNotebook/AIChatPanel.tsx`

Side panel for AI chat:

- Message list with user/assistant bubbles
- Input field + send button
- Real-time streaming updates (append chunks)
- Render citations as clickable links
- Show tool calls (e.g., "Searching papers...")
- Typing indicator while loading
- Conversation history dropdown

**File:** `src/components/LabNotebook/AIUsageBadge.tsx`

Display quota usage:

- Progress bars for completions and messages
- "X/Y remaining today" text
- Red warning when near limit
- "Upgrade to Premium" button (links to subscription modal)
- Tooltip with reset time

**File:** `src/components/LabNotebook/AISubscriptionModal.tsx`

Subscription management modal:

- Free vs Premium comparison table
- Current plan badge
- "Upgrade" button → calls `createCheckout()` (needs Stripe)
- "Cancel Subscription" button for premium users
- Note: Payment flow requires Stripe config on backend

### 5. Integration

**File:** `src/components/LabNotebook/LabNotebookEditor.tsx`

Integrate AI components into main editor:

- Add `AICompletionExtension` to TipTap extensions array
- Render `<AICompletionOverlay editor={editor} noteId={noteId} />`
- Add chat panel toggle button (e.g., "AI Assistant" icon)
- Conditional render `<AIChatPanel noteId={noteId} />`
- Add keyboard shortcut `Cmd+K` to open chat
- Show `<AIUsageBadge />` in toolbar

### 6. Error Handling

Handle specific error cases:

- **429 Too Many Requests:** Show quota exceeded message, prompt upgrade
- **401 Unauthorized:** Redirect to login
- **404 Note Not Found:** Show error message
- **500 Server Error:** Generic error with retry button
- **Network Errors:** Offline indicator, auto-retry

### 7. Testing Strategy

**Without Stripe (Current State):**

- Test free tier: 3 completions + 3 messages per day
- Test admin accounts: Manually set to PREMIUM in Django admin (`/admin/ai/aisubscription/`)
- Test quota enforcement: Try exceeding limits
- Test all AI features: completions, chat, citations

**With Stripe (Later):**

- Test upgrade flow end-to-end
- Test webhook processing for subscription changes
- Test cancellation flow

## Key Files to Create/Modify

**New Files (9):**

- `src/utils/ai/apiClient.ts`
- `src/hooks/ai/useAICompletion.ts`
- `src/hooks/ai/useAIChat.ts`
- `src/hooks/ai/useAIUsage.ts`
- `src/hooks/ai/useAISubscription.ts`
- `src/components/LabNotebook/extensions/AICompletionExtension.ts`
- `src/components/LabNotebook/AICompletionOverlay.tsx`
- `src/components/LabNotebook/AIChatPanel.tsx`
- `src/components/LabNotebook/AIUsageBadge.tsx`
- `src/components/LabNotebook/AISubscriptionModal.tsx`

**Modify (1):**

- `src/components/LabNotebook/LabNotebookEditor.tsx` - Integrate AI components

## Notes

- All core functionality works without Stripe configuration
- Stripe only needed for actual payment processing
- Free users get 3 completions/messages per day (fully functional)
- Admin users can be manually upgraded to PREMIUM in Django admin
- SSE streaming provides real-time, responsive UX
- Citation search is automatic via AI tool calling
- Usage quotas reset daily at midnight UTC
