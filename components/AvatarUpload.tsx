'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Upload, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { cn } from '@/utils/styles';
import AvatarEditor from 'react-avatar-editor';
import { Slider } from '@/components/ui/Slider';

interface AvatarUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageDataUrl: string) => Promise<any>;
  initialImage?: string | null;
  className?: string;
  isLoading?: boolean;
}

export const AvatarUpload = ({
  isOpen,
  onClose,
  onSave,
  initialImage,
  className,
  isLoading,
}: AvatarUploadProps) => {
  const [image, setImage] = useState<File | string | null>(initialImage || null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const editorRef = useRef<AvatarEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  const handleSave = useCallback(async () => {
    if (editorRef.current && image) {
      try {
        const canvas = editorRef.current.getImageScaledToCanvas();
        const dataUrl = canvas.toDataURL('image/png');
        await onSave(dataUrl);
      } catch (error) {
        console.error('Error saving image:', error);
      } finally {
        onClose();
      }
    }
  }, [image, onSave, onClose]);

  const handleRotate = () => {
    setRotate((prevRotate) => prevRotate + 90);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={cn('bg-white rounded-lg p-6 max-w-md w-full', className)}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload Picture</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="border-2 border-dashed rounded-lg p-4 mb-4 flex flex-col items-center justify-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {image ? (
            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <AvatarEditor
                  ref={editorRef}
                  image={image}
                  width={200}
                  height={200}
                  border={20}
                  borderRadius={100}
                  color={[255, 255, 255, 0.6]} // RGBA
                  scale={scale}
                  rotate={rotate}
                  className="mx-auto"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <ZoomOut className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Zoom</span>
                  <ZoomIn className="h-4 w-4 text-gray-500" />
                </div>
                <Slider
                  value={[scale]}
                  min={1}
                  max={2}
                  step={0.01}
                  onValueChange={(values) => setScale(values[0])}
                  className="w-full"
                />
                <div className="flex justify-center space-x-3">
                  <Button
                    onClick={handleRotate}
                    variant="outlined"
                    size="icon"
                    className="rounded-full"
                    tooltip="Rotate"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outlined"
                    size="icon"
                    className="rounded-full"
                    tooltip="Change Image"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 min-w-[200px] min-h-[200px]">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outlined"
                className="mt-2"
              >
                Select Image
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!image || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};
