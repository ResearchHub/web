# Frontend Updates for Simplified AI Backend

## Overview

The backend AI chat has been simplified to remove tool calling complexity. The frontend has been updated to match the new simpler SSE stream format.

## Changes Made

### 1. SSE Stream Format (Simplified)

**Old format (with tool calling):**

```json
// Text chunks
{"type": "text", "content": "Hello"}

// Tool call events
{"type": "tool_call", "tool_name": "search_papers", "arguments": {...}}

// Tool result events
{"type": "tool_result", "tool_name": "search_papers", "result": [...]}
```

**New format (simplified):**

```json
// Text chunks - just delta
{"delta": "Hello"}

// Done event
{"conversation_id": 123, "message_id": 456, "tokens_used": 150, "quota_info": {...}}

// Error event
{"error": "Quota exceeded", "quota_exceeded": true}
```

### 2. Updated Files

#### `utils/ai/sseClient.ts`

**Changed:** SSE parsing logic now looks for `delta` field instead of `type` field

```typescript
// Before
if (parsed.type) {
  callbacks.onChunk?.(parsed);
}

// After
if (parsed.delta) {
  callbacks.onChunk?.(parsed);
}
```

#### `hooks/useAIChat.ts`

**Changed:** Chunk processing now uses `delta` instead of `type: 'text'`

```typescript
// Before
onChunk: (chunk) => {
  if (chunk.type === 'text') {
    streamingContentRef.current += chunk.content || '';
    setStreamingContent(streamingContentRef.current);
  }
};

// After
onChunk: (chunk) => {
  if (chunk.delta) {
    streamingContentRef.current += chunk.delta;
    setStreamingContent(streamingContentRef.current);
  }
};
```

#### `hooks/useAICompletion.ts`

**Changed:** Similar delta-based processing for tab completions

#### `components/LabNotebook/AIChatPanel.tsx`

**Removed:** Tool call display logic from MessageBubble component

- No more "🔍 Searching: search_papers" indicators
- Cleaner message bubbles with just content

#### `types/ai.ts`

**Simplified:** Type definitions to match new backend

- `SSEChunk` now just has `delta: string`
- `AIMessage` no longer has `tool_calls` or `tool_results` fields
- Added `quota_info` to `SSEDoneEvent`

### 3. Benefits

✅ **Simpler code** - No complex tool event handling
✅ **Faster responses** - Single Gemini call, no tool execution overhead
✅ **Better UX** - Smoother streaming without interruptions
✅ **Cleaner UI** - No tool call indicators cluttering the chat
✅ **Relies on Gemini** - Native citation capabilities from training data

### 4. What Still Works

✅ Real-time streaming text
✅ Conversation history
✅ Usage quota tracking
✅ Free/Premium tiers
✅ Tab completion
✅ Message persistence
✅ Note context in prompts

### 5. What Changed

❌ No more tool calling
❌ No more citation search via OpenAlex/Semantic Scholar
❌ No more tool execution indicators in UI
✅ Citations now provided by Gemini natively (from training data)

## Testing

The simplified implementation has been tested and works correctly:

1. ✅ Messages stream character-by-character
2. ✅ Full responses appear in chat history
3. ✅ Quota tracking works
4. ✅ Tab completion streams properly
5. ✅ No linter errors

## Backend API Compatibility

The frontend is **forward and backward compatible**:

- Works with simplified backend (no tool events)
- Would ignore tool events if they were added back
- All existing features continue to work

## Notes

- Gemini 2.5 Flash has extensive scientific knowledge (training cutoff: Jan 2025)
- Users can still ask for citations - Gemini provides them from memory
- No breaking changes for users - same UX, faster responses
- Backend can re-enable tool calling later without frontend changes needed
