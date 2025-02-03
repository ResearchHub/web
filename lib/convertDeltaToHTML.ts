import { DeltaOperation } from 'quill';

interface UserMention {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  authorProfileId: string | null;
}

interface QuillOperation {
  insert: string | { user: UserMention };
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    link?: string;
    underline?: boolean;
    strike?: boolean;
  };
}

interface DeltaContent {
  ops: QuillOperation[];
}

export function convertDeltaToHTML(delta: DeltaContent): string {
  return delta.ops
    .map((op) => {
      // Handle user mentions
      if (typeof op.insert === 'object' && 'user' in op.insert) {
        const user = op.insert.user;
        if (user.firstName && user.lastName) {
          return `<a href="/user/${user.authorProfileId}" class="text-indigo-600 hover:text-indigo-900">@${user.firstName} ${user.lastName}</a>`;
        }
        return '';
      }

      // Handle text content
      if (typeof op.insert === 'string') {
        let text = op.insert;

        // Apply basic formatting
        if (op.attributes) {
          if (op.attributes.bold) text = `<strong>${text}</strong>`;
          if (op.attributes.italic) text = `<em>${text}</em>`;
          if (op.attributes.underline) text = `<u>${text}</u>`;
          if (op.attributes.strike) text = `<s>${text}</s>`;
          if (op.attributes.link)
            text = `<a href="${op.attributes.link}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }

        // Handle line breaks
        if (text === '\n') return '<br/>';

        return text;
      }
      return '';
    })
    .join('');
}
