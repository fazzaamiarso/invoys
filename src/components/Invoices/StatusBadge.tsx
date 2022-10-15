import { InvoiceStatus } from '@prisma/client';
import clsx from 'clsx';

const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const statusText = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <div
      className={clsx(
        'text-xs rounded-md py-2 w-max font-semibold',
        status === 'PAID' && 'bg-[#dcfde7] text-[#176434]',
        status === 'PENDING' && 'bg-[#fff9c2] text-[#854d0e]',
        status === 'OVERDUE' && 'bg-[#a29c9c] text-[#981a1a]',
        status === 'REJECTED' && 'bg-[#fde7f3] text-[#9f1a4e]'
      )}>
      <span className="px-3">{statusText}</span>
    </div>
  );
};

export default StatusBadge;
