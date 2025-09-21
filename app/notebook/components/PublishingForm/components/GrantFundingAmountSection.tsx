import { useFormContext } from 'react-hook-form';
import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/form/Input';
import { SectionHeader } from './SectionHeader';

export function GrantFundingAmountSection() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={DollarSign}>Funding Amount</SectionHeader>
      <div className="mt-2">
        <Input
          {...register('budget')}
          placeholder="10,000"
          type="text"
          inputMode="numeric"
          className="w-full"
          error={errors.budget?.message?.toString()}
          rightElement={
            <div className="flex items-center pr-4 font-medium text-sm text-orange-600">USD</div>
          }
          helperText="How much money you are giving for this RFP"
          required
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, '');
            setValue('budget', numericValue, { shouldValidate: true });

            if (numericValue) {
              e.target.value = new Intl.NumberFormat('en-US').format(parseInt(numericValue));
            } else {
              e.target.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}
