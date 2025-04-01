'use client';

import { useState } from 'react';
import { AssetService, UploadFileResult } from '@/services/asset.service';
import { ApiError } from '@/services/types';

interface UseAssetUploadState {
  data: UploadFileResult | null;
  loading: boolean;
  error: string | null;
}

type UploadAssetFn = (
  file: File,
  entity: 'comment' | 'note' | 'paper' | 'post'
) => Promise<UploadFileResult>;
type UseAssetUploadReturn = [UseAssetUploadState, UploadAssetFn];

export const useAssetUpload = (): UseAssetUploadReturn => {
  const [data, setData] = useState<UploadFileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAsset = async (
    file: File,
    entity: 'comment' | 'note' | 'paper' | 'post'
  ): Promise<UploadFileResult> => {
    setLoading(true);
    setError(null);

    try {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const result = await AssetService.uploadFile(file, entity);

      setData(result);

      return result;
    } catch (err) {
      const errorMsg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to upload file';

      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return [{ data, loading, error }, uploadAsset];
};
