import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/form/Input';
import type { PublishingFormData } from '../schema';

/** The total a proposal asks funders for, in whole US dollars. */
export function FundingGoalField() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<PublishingFormData>();

  return (
    <Input
      data-testid="funding-goal-input"
      {...register('budget')}
      label="Funding Goal"
      required
      placeholder="1,000"
      type="text"
      inputMode="numeric"
      className="w-full"
      error={errors.budget?.message?.toString()}
      rightElement={
        <div className="flex items-center pr-4 font-medium text-sm text-gray-900">USD</div>
      }
      helperText="Set your total funding goal for this research project"
      onChange={(e) => {
        const numericValue = e.target.value.replaceAll(/\D/g, '');
        setValue('budget', numericValue, { shouldValidate: true });

        if (numericValue) {
          e.target.value = new Intl.NumberFormat('en-US').format(Number.parseInt(numericValue));
        } else {
          e.target.value = '';
        }
      }}
    />
  );
}
