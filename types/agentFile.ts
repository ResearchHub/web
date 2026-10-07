/** Files attached to agent chats (`/api/research_ai/files/`); wire shapes stay snake_case. */

export type AgentFileStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

/** A file as every response shows it (`public_file` on the backend). */
export interface AgentFile {
  id: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  status: AgentFileStatus;
  /** User-safe reason a `FAILED` file could not be processed. */
  error: string | null;
  /** PDFs only. */
  page_count: number | null;
  /** Equal to `page_count` for a scan with no readable text; absent on older backends. */
  pages_without_text?: number | null;
  text_truncated: boolean;
  /** Null until the file is sent with a message; a file is sent once. */
  conversation_id: number | null;
  message_id: number | null;
  created_date: string;
}

/** Presigned S3 form: POST `fields`, then the file as `file`, to `url`. */
export interface AgentFileUpload {
  url: string;
  fields: Record<string, string>;
}

export interface AgentFileCreateResponse extends AgentFile {
  upload: AgentFileUpload;
}

/** Mirrors `agent_files/config.py`; the API does not publish its limits. */
export const AGENT_FILE_LIMITS = {
  maxFileBytes: 25 * 1024 * 1024,
  maxFilesPerMessage: 5,
  maxFilesPerChat: 20,
} as const;

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Mirrors `agent_files/extraction.py`. */
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': DOCX,
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.csv': 'text/csv',
  '.tsv': 'text/tab-separated-values',
  '.tex': 'application/x-tex',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const KIND_BY_CONTENT_TYPE: Record<string, string> = {
  'application/pdf': 'PDF',
  [DOCX]: 'Word document',
  'text/plain': 'Text file',
  'text/markdown': 'Markdown file',
  'text/csv': 'CSV file',
  'text/tab-separated-values': 'TSV file',
  'application/x-tex': 'LaTeX file',
  'image/png': 'PNG image',
  'image/jpeg': 'JPEG image',
  'image/gif': 'GIF image',
  'image/webp': 'WebP image',
};

export const AGENT_FILE_EXTENSIONS = Object.keys(CONTENT_TYPE_BY_EXTENSION);

// The server's own wording for the same refusals.
export const UNSUPPORTED_FILE_TYPE = `Upload a PDF, Word (.docx), text, or image file (${AGENT_FILE_EXTENSIONS.join(', ')}).`;
export const FILE_TOO_LARGE = `Files can be at most ${AGENT_FILE_LIMITS.maxFileBytes / (1024 * 1024)} MB.`;
export const TOO_MANY_FILES_PER_MESSAGE = `A message can carry at most ${AGENT_FILE_LIMITS.maxFilesPerMessage} files.`;
export const TOO_MANY_FILES_PER_CHAT = `A chat can hold at most ${AGENT_FILE_LIMITS.maxFilesPerChat} files. Start a new chat to attach more.`;

function extensionOf(filename: string): string {
  const name = filename.replace(/^\.+/, '');
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

/** Why the server would refuse this file, or null; it reads the MIME type only without an extension. */
export function agentFileRefusal(file: {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}): string | null {
  const extension = extensionOf(file.name);
  const supported = extension
    ? extension in CONTENT_TYPE_BY_EXTENSION
    : file.type.split(';')[0].trim().toLowerCase() in KIND_BY_CONTENT_TYPE;
  if (!supported) return UNSUPPORTED_FILE_TYPE;
  if (file.size === 0) return 'Empty files can’t be attached.';
  if (file.size > AGENT_FILE_LIMITS.maxFileBytes) return FILE_TOO_LARGE;
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function agentFileKind(file: Pick<AgentFile, 'content_type' | 'filename'>): string {
  const known = KIND_BY_CONTENT_TYPE[file.content_type];
  if (known) return known;
  const extension = extensionOf(file.filename);
  return extension.length > 1 ? `${extension.slice(1).toUpperCase()} file` : 'File';
}

/** "PDF · 12 pages". */
export function describeAgentFile(
  file: Pick<AgentFile, 'content_type' | 'filename' | 'page_count'>
): string {
  const kind = agentFileKind(file);
  if (file.page_count == null) return kind;
  return `${kind} · ${file.page_count.toLocaleString()} ${file.page_count === 1 ? 'page' : 'pages'}`;
}

/** What the assistant will not get from a processed file. */
export function agentFileCaveats(
  file: Pick<AgentFile, 'page_count' | 'pages_without_text' | 'text_truncated'>
): string[] {
  const caveats: string[] = [];
  // A null count is unknown, not zero.
  const unread = file.pages_without_text ?? 0;
  if (file.page_count != null && unread > 0) {
    caveats.push(
      unread >= file.page_count
        ? 'No readable text found'
        : `${unread.toLocaleString()} of ${file.page_count.toLocaleString()} pages have no readable text`
    );
  }
  if (file.text_truncated) caveats.push('Too long to read in full');
  return caveats;
}
