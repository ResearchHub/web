import { useFormContext, Controller } from 'react-hook-form';
import { Image as ImageIcon } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { FileUpload } from '@/components/ui/form/FileUpload';
import { useState } from 'react';
import { PublishingFormData } from '../schema';
import Image from 'next/image';

export function WorkImageSection() {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<PublishingFormData>();

  const articleType = watch('articleType');
  const workId = watch('workId');
  const coverImage = watch('coverImage');
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: Error) => {
    setError(error.message);
  };

  // Helper function to check if file is valid
  const isValidFile = (file: any): file is File => {
    return Boolean(file instanceof File && file.name && file.size > 0);
  };

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={ImageIcon}>Cover Image</SectionHeader>
      <div className="mt-2">
        <div className="mt-4">
          <Controller
            name="coverImage"
            control={control}
            render={({ field }) => {
              // Check if file is a valid File object or null
              const fileValue =
                field.value?.file && isValidFile(field.value.file) ? field.value.file : null;

              return (
                <FileUpload
                  onFileSelect={(file) => {
                    field.onChange({ file, url: null });
                  }}
                  onFileRemove={() => {
                    field.onChange(null);
                  }}
                  onError={handleError}
                  accept={['image/jpeg', 'image/png']}
                  maxSizeMB={10}
                  selectedFile={fileValue}
                  existingImageUrl={field.value?.url || null}
                  error={error || (errors.coverImage?.message as string) || null}
                  dragDropTitle="Drag and drop your image here"
                />
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
