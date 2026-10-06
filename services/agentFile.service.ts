import { ApiClient } from './client';
import { chatErrorCode, chatErrorDetail, chatErrorStatus } from './notebookChat.service';
import {
  FILE_TOO_LARGE,
  type AgentFile,
  type AgentFileCreateResponse,
  type AgentFileUpload,
} from '@/types/agentFile';

export interface CreateAgentFileUploadParams {
  filename: string;
  sizeBytes: number;
  contentType?: string;
}

export interface UploadToStorageOptions {
  /** Share of the bytes sent, 0–1. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/** The bucket refused or never received the bytes; `message` is user-facing. */
export class AgentFileUploadError extends Error {
  constructor(
    message: string,
    public readonly aborted = false
  ) {
    super(message);
    this.name = 'AgentFileUploadError';
  }
}

function storageRefusal(responseText: string): string {
  if (responseText.includes('EntityTooLarge')) return FILE_TOO_LARGE;
  if (/expired/i.test(responseText)) {
    return 'The upload took too long to start. Remove the file and attach it again.';
  }
  return 'The file could not be uploaded. Remove it and try again.';
}

/**
 * REST layer for files attached to agent chats: create, send the bytes
 * straight to the private bucket, complete, then poll until processed.
 */
export class AgentFileService {
  private static readonly BASE_PATH = '/api/research_ai/files/';

  /** The type comes from the extension; `contentType` only matters without one. */
  static async createUpload({
    filename,
    sizeBytes,
    contentType,
  }: CreateAgentFileUploadParams): Promise<AgentFileCreateResponse> {
    return ApiClient.post<AgentFileCreateResponse>(this.BASE_PATH, {
      filename,
      size_bytes: sizeBytes,
      ...(contentType && { content_type: contentType }),
    });
  }

  /** XHR rather than fetch, which reports no upload progress. */
  static uploadToStorage(
    upload: AgentFileUpload,
    file: Blob,
    { onProgress, signal }: UploadToStorageOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new AgentFileUploadError('Upload cancelled.', true));
        return;
      }
      const form = new FormData();
      for (const [name, value] of Object.entries(upload.fields)) form.append(name, value);
      // S3 ignores every form field that follows the file.
      form.append('file', file);

      const request = new XMLHttpRequest();
      request.open('POST', upload.url);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) onProgress?.(event.loaded / event.total);
      };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) resolve();
        else reject(new AgentFileUploadError(storageRefusal(request.responseText)));
      };
      request.onerror = () =>
        reject(
          new AgentFileUploadError(
            'The upload was interrupted. Check your connection, then attach the file again.'
          )
        );
      request.onabort = () => reject(new AgentFileUploadError('Upload cancelled.', true));
      signal?.addEventListener('abort', () => request.abort(), { once: true });
      request.send(form);
    });
  }

  /** Idempotent; 409 `upload_incomplete` while the object is not in the bucket yet. */
  static async completeUpload(fileId: number): Promise<AgentFile> {
    return ApiClient.post<AgentFile>(`${this.BASE_PATH}${fileId}/complete/`);
  }

  /** Reading is also what makes the server fail a file stuck in `PROCESSING`. */
  static async getFile(fileId: number): Promise<AgentFile> {
    return ApiClient.get<AgentFile>(`${this.BASE_PATH}${fileId}/`);
  }

  /** Only a file not yet sent can be removed; 409 `attachment_sent` otherwise. */
  static async deleteFile(fileId: number): Promise<void> {
    await ApiClient.deleteNoContent(`${this.BASE_PATH}${fileId}/`);
  }

  /** Short-lived: fetch one per open rather than keeping it. */
  static async getDownloadUrl(fileId: number): Promise<string> {
    const response = await ApiClient.get<{ url: string }>(`${this.BASE_PATH}${fileId}/download/`);
    return response.url;
  }
}

/** DRF words a throttle as "Expected available in N seconds." */
function throttleMessage(detail: string | undefined): string {
  const seconds = Number(/\b(\d{1,9}) second/.exec(detail ?? '')?.[1]);
  if (!Number.isFinite(seconds)) return detail ?? 'Too many uploads. Try again later.';
  const wait =
    seconds < 90
      ? 'in about a minute'
      : `in about ${Math.ceil(seconds / 60).toLocaleString()} minutes`;
  return `You’ve started too many uploads. Try again ${wait}.`;
}

/** Copy for a failed file request: the server's `detail` wherever it gave one. */
export function agentFileErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AgentFileUploadError) return error.message;
  const status = chatErrorStatus(error);
  if (status == null) return 'Couldn’t reach the server. Check your connection and try again.';
  if (status === 429) return throttleMessage(chatErrorDetail(error));
  // A 5xx without a code is a gateway page, not a message written for the user.
  if (status >= 500 && chatErrorCode(error) == null) return fallback;
  return chatErrorDetail(error) ?? fallback;
}
