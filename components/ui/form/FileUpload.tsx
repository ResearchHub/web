'use client';

import { useState, useRef, ChangeEvent, DragEvent, useEffect, MouseEvent } from 'react';
import { cn } from '@/utils/styles';
import { FileUp, X, FileText, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FileService, UploadFileResult } from '@/services/file.service';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload?: (result: UploadFileResult) => void;
  onFileRemove?: () => void;
  onError?: (error: Error) => void;
  accept?: string[];
  maxSizeMB?: number;
  className?: string;
  selectedFile?: File | null;
  existingImageUrl?: string | null;
  error?: string | null;
  uploadImmediately?: boolean;
  dragDropTitle?: string;
}

// Helper function to extract filename from URL
const getFileNameFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop();

    if (filename && filename.includes('.')) {
      return decodeURIComponent(filename);
    }
    return 'Existing image';
  } catch (e) {
    // If URL parsing fails, return generic text
    return 'Existing image';
  }
};

export function FileUpload({
  onFileSelect,
  onFileUpload,
  onFileRemove,
  onError,
  accept = ['application/pdf'],
  maxSizeMB = 100,
  className,
  selectedFile,
  existingImageUrl = null,
  error,
  uploadImmediately = false,
  dragDropTitle = 'Drag and drop your PDF here',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setFileError(null);
    // Check if the file type is acceptable
    const isAcceptable = accept.some((type) => file.type.match(type));

    if (!isAcceptable) {
      // Format the accepted file types for the error message
      const acceptedTypes = accept
        .map((type) => {
          const parts = type.split('/');
          return parts.length > 1 ? parts[1].toUpperCase() : type.toUpperCase();
        })
        .join(', ');

      const errorMsg = `Only ${acceptedTypes} files are accepted`;
      setFileError(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxSizeMB}MB`;
      setFileError(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    // Notify component consumer about the selected file
    onFileSelect(file);

    // If uploadImmediately is true, upload the file
    if (uploadImmediately && onFileUpload) {
      try {
        setIsUploading(true);
        const result = await FileService.uploadFile(file);
        onFileUpload(result);
      } catch (error) {
        console.error('Error uploading file:', error);
        setFileError('Failed to upload file. Please try again.');
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onFileRemove) {
      onFileRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError(null);
  };

  const acceptString = accept.join(',');

  useEffect(() => {
    if (selectedFile) {
      const binaryData = [];
      binaryData.push(selectedFile);
      const url = window.URL.createObjectURL(new Blob(binaryData, { type: selectedFile.type }));
      setFilePreviewUrl(url);

      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    } else if (existingImageUrl) {
      setFilePreviewUrl(existingImageUrl);
      return () => {};
    } else {
      setFilePreviewUrl(null);
    }
  }, [selectedFile, existingImageUrl]);

  const hasImage = Boolean(
    (selectedFile && selectedFile.type && selectedFile.type.startsWith('image/')) ||
      (existingImageUrl && !selectedFile)
  );

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptString}
        onChange={handleFileInputChange}
        disabled={isUploading}
      />

      {!selectedFile && !existingImageUrl ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
            error || fileError ? 'border-red-500 bg-red-50' : '',
            isUploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={isUploading ? undefined : handleBrowseClick}
        >
          <div className="flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
                <h3 className="text-gray-700 font-medium">Uploading file...</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait while your file is being uploaded
                </p>
              </>
            ) : (
              <>
                <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                <h3 className="text-gray-700 font-medium">{dragDropTitle}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  or click anywhere in this area to{' '}
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    browse files
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Maximum file size: {maxSizeMB}MB</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {hasImage && filePreviewUrl ? (
                <div
                  className="h-12 w-12 rounded overflow-hidden flex-shrink-0 relative group cursor-pointer"
                  onClick={isUploading ? undefined : handleBrowseClick}
                >
                  <img src={filePreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <div className="text-white text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs font-medium">Change</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 p-2 rounded flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {selectedFile ? (
                  <>
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : existingImageUrl ? (
                  <p className="font-medium truncate">{getFileNameFromUrl(existingImageUrl)}</p>
                ) : null}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              aria-label="Remove file"
              disabled={isUploading}
              className="flex-shrink-0 ml-2 z-10"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      )}

      {(error || fileError) && <p className="mt-2 text-sm text-red-600">{error || fileError}</p>}
    </div>
  );
}
