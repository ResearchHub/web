import { ApiClient } from './client';

export interface UploadFileResult {
  objectKey: string;
  absoluteUrl: string;
  fileName: string;
}

export class FileService {
  private static readonly BASE_PATH = '/';

  /**
   * Uploads a file to the server
   *
   * @param file The file to upload
   * @returns A promise that resolves to the upload result
   */
  static async uploadFile(file: File): Promise<UploadFileResult> {
    try {
      const formData = new FormData();
      formData.append('filename', file.name);

      const url = process.env.NEXT_PUBLIC_API_URL + this.BASE_PATH + 'paper/upload/';

      // Get the authorization header using ApiClient helper
      const headers = await ApiClient['getHeaders']('POST');

      // Remove Content-Type header so browser can set correct multipart boundary
      delete headers['Content-Type'];

      // Get the presigned URL
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to get presigned URL: ${response.statusText}`);
      }

      const data = await response.json();
      const { presigned_url, object_key, object_url } = data;

      if (!presigned_url || !object_key) {
        throw new Error('Invalid response from server');
      }

      // Upload the file to S3 using the presigned URL
      const uploadResponse = await fetch(presigned_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      return {
        objectKey: object_key,
        absoluteUrl: object_url,
        fileName: file.name,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}
