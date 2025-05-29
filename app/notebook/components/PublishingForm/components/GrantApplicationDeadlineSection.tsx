import { useFormContext } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { DatePicker } from '@/components/ui/form/DatePicker';
import { SectionHeader } from './SectionHeader';
import { PublishingFormData } from '../schema';

export function GrantApplicationDeadlineSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PublishingFormData>();

  const applicationDeadline = watch('applicationDeadline');

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Calendar}>Application Deadline</SectionHeader>
      <div className="mt-2">
        <DatePicker
          value={applicationDeadline}
          onChange={(date) => setValue('applicationDeadline', date, { shouldValidate: true })}
          placeholder="Select deadline date"
          error={errors.applicationDeadline?.message?.toString()}
          helperText="When applications for this grant should be submitted by"
          minDate={new Date()} // Prevent selecting past dates
          required
        />
      </div>
    </div>
  );
}
