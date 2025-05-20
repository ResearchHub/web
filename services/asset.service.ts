import { ApiClient } from './client';

export interface UploadFileResult {
  objectKey: string;
  absoluteUrl: string;
  fileName: string;
}

export class AssetService {
  private static readonly BASE_PATH = '/api/asset';

  /**
   * Uploads a file to the server
   *
   * @param file The file to upload
   * @param entity The entity type this file belongs to
   * @returns A promise that resolves to the upload result
   */
  static async uploadFile(
    file: File,
    entity: 'comment' | 'note' | 'paper' | 'post'
  ): Promise<UploadFileResult> {
    try {
      // Step 1: Get the presigned URL
      const uploadParams = {
        filename: file.name,
        content_type: this.getContentType(file),
        entity: entity,
      };

      const response = await ApiClient.post<{
        presigned_url: string;
        object_key: string;
        object_url: string;
      }>(`${this.BASE_PATH}/upload/`, uploadParams);

      const {
        presigned_url: presignedUrl,
        object_key: objectKey,
        object_url: objectUrl,
      } = response;

      if (!presignedUrl || !objectKey) {
        throw new Error('Invalid response from server');
      }

      // Step 2: Upload the file to S3 using the presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      return {
        objectKey: objectKey,
        absoluteUrl: objectUrl,
        fileName: file.name,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  /**
   * Determines the content type based on the file
   *
   * @param file The file to check
   * @returns The content type string
   */
  private static getContentType(file: File): 'application/pdf' | 'image/png' | 'image/jpeg' {
    if (file.type === 'application/pdf') {
      return 'application/pdf';
    } else if (file.type === 'image/png') {
      return 'image/png';
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      return 'image/jpeg';
    }

    // Default based on extension if mime type is not recognized
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return 'application/pdf';
    } else if (extension === 'png') {
      return 'image/png';
    } else if (extension === 'jpg' || extension === 'jpeg') {
      return 'image/jpeg';
    }

    // Default to jpeg if we can't determine
    return 'image/jpeg';
  }
}
