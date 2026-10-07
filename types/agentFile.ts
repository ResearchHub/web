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

/** One accepted extension, lowercase with its dot; `label` is a mid-sentence noun ("text file"). */
export interface AgentFileType {
  extension: string;
  content_type: string;
  label: string;
}

/** `GET files/limits/`: what the server checks before it takes an upload. */
export interface AgentFileLimits {
  max_file_bytes: number;
  max_files_per_message: number;
  max_files_per_conversation: number;
  max_unsent_files: number;
  supported_types: AgentFileType[];
}

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** The backend's defaults, in force until its limits are read and on a server that publishes none. */
export const DEFAULT_AGENT_FILE_LIMITS: AgentFileLimits = {
  max_file_bytes: 25 * 1024 * 1024,
  max_files_per_message: 5,
  max_files_per_conversation: 20,
  max_unsent_files: 20,
  supported_types: [
    { extension: '.pdf', content_type: 'application/pdf', label: 'PDF' },
    { extension: '.docx', content_type: DOCX, label: 'Word document' },
    { extension: '.txt', content_type: 'text/plain', label: 'text file' },
    { extension: '.md', content_type: 'text/markdown', label: 'Markdown file' },
    { extension: '.markdown', content_type: 'text/markdown', label: 'Markdown file' },
    { extension: '.csv', content_type: 'text/csv', label: 'CSV file' },
    { extension: '.tsv', content_type: 'text/tab-separated-values', label: 'TSV file' },
    { extension: '.tex', content_type: 'application/x-tex', label: 'LaTeX file' },
    { extension: '.png', content_type: 'image/png', label: 'PNG image' },
    { extension: '.jpg', content_type: 'image/jpeg', label: 'JPEG image' },
    { extension: '.jpeg', content_type: 'image/jpeg', label: 'JPEG image' },
    { extension: '.gif', content_type: 'image/gif', label: 'GIF image' },
    { extension: '.webp', content_type: 'image/webp', label: 'WebP image' },
  ],
};

export const agentFileExtensions = (limits: AgentFileLimits): string[] =>
  limits.supported_types.map((type) => type.extension);

/** Whole megabytes, rounded down as the server words it. */
export const maxFileMegabytes = (limits: AgentFileLimits): number =>
  Math.floor(limits.max_file_bytes / (1024 * 1024));

// The server's own wording for the same refusals.
export const EMPTY_FILE = 'Empty files cannot be attached.';
export const unsupportedFileType = (limits: AgentFileLimits) =>
  `Upload a PDF, Word (.docx), text, or image file (${agentFileExtensions(limits).join(', ')}).`;
export const fileTooLarge = (limits: AgentFileLimits) =>
  `Files can be at most ${maxFileMegabytes(limits)} MB.`;
export const tooManyFilesPerMessage = (limits: AgentFileLimits) =>
  `A message can carry at most ${limits.max_files_per_message} files.`;
export const tooManyFilesPerChat = (limits: AgentFileLimits) =>
  `A chat can hold at most ${limits.max_files_per_conversation} files. Start a new chat to attach more.`;

function extensionOf(filename: string): string {
  const name = filename.replace(/^\.+/, '');
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

/** Why the server would refuse this file, or null; it reads the MIME type only without an extension. */
export function agentFileRefusal(
  file: { readonly name: string; readonly size: number; readonly type: string },
  limits: AgentFileLimits
): string | null {
  const extension = extensionOf(file.name);
  const contentType = file.type.split(';')[0].trim().toLowerCase();
  const supported = limits.supported_types.some((type) =>
    extension ? type.extension === extension : type.content_type === contentType
  );
  if (!supported) return unsupportedFileType(limits);
  if (file.size === 0) return EMPTY_FILE;
  if (file.size > limits.max_file_bytes) return fileTooLarge(limits);
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The file's kind, capitalised to open a line: "Text file". */
export function agentFileKind(
  file: Pick<AgentFile, 'content_type' | 'filename'>,
  limits: AgentFileLimits
): string {
  const label = limits.supported_types.find(
    (type) => type.content_type === file.content_type
  )?.label;
  if (label) return label.charAt(0).toUpperCase() + label.slice(1);
  const extension = extensionOf(file.filename);
  return extension.length > 1 ? `${extension.slice(1).toUpperCase()} file` : 'File';
}

/** "PDF · 12 pages". */
export function describeAgentFile(
  file: Pick<AgentFile, 'content_type' | 'filename' | 'page_count'>,
  limits: AgentFileLimits
): string {
  const kind = agentFileKind(file, limits);
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
