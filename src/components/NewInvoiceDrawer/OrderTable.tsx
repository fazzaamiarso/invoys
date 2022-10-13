import { TrashIcon } from '@heroicons/react/24/solid';
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { InvoiceOrderInput } from './InvoiceForm';
import s from './tables.module.css';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    removeRow: (rowIndex: number) => void;
  }
}

const defaultColumn: Partial<ColumnDef<InvoiceOrderInput[0]>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState(initialValue);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initialType = useRef(typeof value);

    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return (
      <input
        type={initialType.current === 'string' ? 'text' : 'number'}
        value={value as string}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        autoComplete="off"
        required
        className="w-full rounded-sm border-gray-300 text-sm text-gray-700"
      />
    );
  },
};

const columnHelper = createColumnHelper<InvoiceOrderInput[0]>();
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
    cell: data => data.getValue(),
  }),
  columnHelper.display({
    id: 'actions',
    cell: cell => (
      <button
        type="button"
        onClick={() => cell.table.options.meta?.removeRow(cell.row.index)}
        disabled={cell.table.getRowModel().rows.length <= 1}
        className="disabled:text-gray-400 ">
        <TrashIcon className="h-4" />
      </button>
    ),
  }),
];

type OrderTableProps = {
  orderData: InvoiceOrderInput;
  setOrderData: Dispatch<SetStateAction<InvoiceOrderInput>>;
};

const OrderTable = ({ orderData, setOrderData }: OrderTableProps) => {
  const table = useReactTable({
    columns,
    data: orderData,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setOrderData(old =>
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
      removeRow: rowIndex =>
        setOrderData(old => old.filter((_, index) => index !== rowIndex)),
    },
  });

  return (
    <table
      className={clsx(s['order-table'], 'w-full table-fixed border-collapse')}>
      <thead className="">
        <tr className="">
          {table.getFlatHeaders().map(header => (
            <th
              key={header.id}
              scope="col"
              className="text-sm text-gray-500 !font-semibold">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="">
        {table.getRowModel().rows.map(row => {
          return (
            <tr key={row.id} className="">
              {row.getVisibleCells().map(cell => {
                return (
                  <td key={cell.id} className="text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default OrderTable;
