import { TrashIcon } from '@heroicons/react/24/solid';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter } from '@utils/tableHelper';
import clsx from 'clsx';
import { FieldValues, UseFormRegister } from 'react-hook-form';
import { InvoiceOrderInput } from './InvoiceForm';
import s from './tables.module.css';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    removeRow: (rowIndex: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
  }
}

type TableInputProps = {
  type: 'text' | 'number';
  rowIdx: number;
  columnId: string;
  table: Table<InvoiceOrderInput[0]>;
};
const TableInput = ({ type, rowIdx, columnId, table }: TableInputProps) => {
  return (
    <input
      {...table.options.meta?.register(`orders.${rowIdx}.${columnId}`)}
      type={type}
      autoComplete="off"
      required
      className="w-full rounded-sm border-gray-300 text-sm text-gray-700"
    />
  );
};

const columnHelper = createColumnHelper<InvoiceOrderInput[0]>();
const columns = [
  columnHelper.accessor('name', {
    header: 'Item',
    cell: props => (
      <TableInput
        type="text"
        columnId={props.column.id}
        rowIdx={props.row.index}
        table={props.table}
      />
    ),
  }),
  columnHelper.accessor('quantity', {
    header: 'qty',
    cell: props => (
      <TableInput
        type="number"
        columnId={props.column.id}
        rowIdx={props.row.index}
        table={props.table}
      />
    ),
  }),
  columnHelper.accessor('amount', {
    header: 'price',
    cell: props => (
      <TableInput
        type="number"
        columnId={props.column.id}
        rowIdx={props.row.index}
        table={props.table}
      />
    ),
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

type OrderTableProps<T extends FieldValues> = {
  orders: InvoiceOrderInput;
  onRemoveField: (fieldIdx: number) => void;
  register: UseFormRegister<T>;
};

const OrderTable = <T extends FieldValues>({
  orders,
  onRemoveField,
  register,
}: OrderTableProps<T>) => {
  const table = useReactTable({
    columns,
    data: orders,
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
    meta: {
      register,
      removeRow: rowIndex => onRemoveField(rowIndex),
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
