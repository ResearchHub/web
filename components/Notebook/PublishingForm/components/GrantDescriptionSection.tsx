import { useFormContext } from 'react-hook-form';
import { FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/form/Textarea';
import { SectionHeader } from './SectionHeader';
import { cn } from '@/utils/styles';
import type { SectionProps } from './SectionProps';

export function GrantDescriptionSection({ className }: SectionProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={cn('py-3 px-6', className)}>
      <SectionHeader icon={FileText}>Short Description</SectionHeader>
      <div className="mt-2">
        <Textarea
          data-testid="grant-description-input"
          {...register('shortDescription')}
          placeholder="Describe what this RFP is for and what you're looking to fund"
          error={errors.shortDescription?.message?.toString()}
          required
        />
      </div>
    </div>
  );
}
