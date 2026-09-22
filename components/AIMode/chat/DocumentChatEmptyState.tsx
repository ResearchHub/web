import { MessageSquare } from 'lucide-react';

/** A document is open and no one has said anything about it yet. */
export function DocumentChatEmptyState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2.5 px-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <MessageSquare className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <p className="text-[15px] font-semibold text-gray-900">A new chat about this document</p>
      <p className="max-w-[300px] text-[13px] leading-relaxed text-gray-600">
        The assistant can read this document and propose edits you accept or reject.
      </p>
    </div>
  );
}
