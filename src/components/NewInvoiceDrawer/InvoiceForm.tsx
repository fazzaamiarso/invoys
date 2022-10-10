import { TrashIcon } from '@heroicons/react/24/solid';
import { OrderItem } from '@prisma/client';
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    removeRow: (rowIndex: number) => void;
  }
}

const defaultColumn: Partial<ColumnDef<OrderItem>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState(initialValue);

    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return (
      <input
        type={typeof value === 'string' ? 'text' : 'number'}
        value={value as string}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        className="w-20"
      />
    );
  },
};

const columnHelper = createColumnHelper<OrderItem>();
const columns = [
  columnHelper.accessor('name', {
    header: 'Item',
  }),
  columnHelper.accessor('quantity', {
    header: 'qty',
  }),
  columnHelper.accessor('amount', {
    header: 'price',
  }),
  columnHelper.accessor(row => `${row.amount * row.quantity}`, {
    header: 'total',
    cell: data => <span>{data.getValue()}</span>,
  }),
  columnHelper.display({
    id: 'actions',
    cell: cell => (
      <button
        type="button"
        onClick={() => cell.table.options.meta?.removeRow(cell.row.index)}
        disabled={cell.table.getRowModel().rows.length <= 1}>
        <TrashIcon className="disabled:text-gray-400 h-4" />
      </button>
    ),
  }),
];

type FieldValues = {
  name: string;
  dueDate: Date;
  notes?: string;
  currency: string;
  customer: string;
};

const InvoiceForm = () => {
  const { register, handleSubmit } = useForm<FieldValues>();

  const [data, setData] = useState<OrderItem[]>([
    {
      id: '1',
      name: 'Landing page',
      amount: 750,
      quantity: 3,
      createdAt: new Date(),
      invoiceId: '1',
    },
  ]);
  const table = useReactTable({
    columns,
    data,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
      removeRow: rowIndex => {
        if (data.length <= 1) return;
        setData(old => old.filter((_, index) => index !== rowIndex));
      },
    },
  });
  const onSubmit: SubmitHandler<FieldValues> = async fieldValues => {
    // const mutation = trpc.invoice.create.useMutation();
    // mutation.mutate({ ...fieldValues, recipientId: '1', orders: data });
    console.table(fieldValues);
    console.log(data);
  };

  const totalAmount = data.reduce(
    (acc, currOrder) => acc + currOrder.amount * currOrder.quantity,
    0
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="name">Project/description</label>
        <input type="text" {...register('name')} id="name" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="currency">Currency</label>
        <input type="text" {...register('currency')} id="currency" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="customer">Recipient</label>
        <input type="text" {...register('customer')} id="customer" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="dueDate">Due Date</label>
        <input type="date" {...register('dueDate')} id="dueDate" />
      </div>
      {/* TABLE */}
      <div className="w-full">
        <table className="w-full">
          <thead className="">
            <tr>
              {table.getFlatHeaders().map(header => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* TABLE END */}
        <div className="w-full flex justify-between items-center">
          <button
            type="button"
            className="text-blue-500"
            onClick={() =>
              setData(prevData => [
                ...prevData,
                {
                  id: '',
                  name: '',
                  amount: 0,
                  quantity: 0,
                  createdAt: new Date(),
                  invoiceId: '1',
                },
              ])
            }>
            + add item
          </button>
          <div>Total {totalAmount}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="notes">Additional Notes</label>
        <textarea {...register('notes')} id="notes" />
      </div>
      <div className="flex items-center justify-between w-full">
        <button type="button" className="text-sm">
          PREVIEW
        </button>
        <button className="rounded-md px-4 py-2 bg-pink-500 text-white font-semibold flex items-center justify-center">
          Create Invoice
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
