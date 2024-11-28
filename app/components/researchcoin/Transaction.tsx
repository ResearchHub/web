import { LucideIcon } from 'lucide-react';

interface TransactionProps {
  type: string;
  date: string;
  amount: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
}

export const Transaction: React.FC<TransactionProps> = ({
  type,
  date,
  amount,
  value,
  icon: Icon,
  iconColor
}) => {
  return (
    <div className="py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 p-2 rounded-full">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="font-medium">{type}</p>
          <p className="text-sm text-gray-600">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{amount}</p>
        <p className="text-sm text-gray-600">{value}</p>
      </div>
    </div>
  );
}; 