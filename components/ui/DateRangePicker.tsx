import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { DatePicker } from './form/DatePicker';
import { cn } from '@/utils/styles';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      onDateRangeChange(tempStartDate, tempEndDate);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outlined"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[200px] justify-between"
      >
        <Calendar className="h-4 w-4" />
        <span>{formatDateRange()}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                value={tempStartDate}
                onChange={(date) => setTempStartDate(date)}
                maxDate={tempEndDate || undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                value={tempEndDate}
                onChange={(date) => setTempEndDate(date)}
                minDate={tempStartDate || undefined}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={!tempStartDate || !tempEndDate}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
