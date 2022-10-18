import { TrashIcon } from '@heroicons/react/24/solid';
import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter } from '@utils/tableHelper';
import { InferProcedures } from '@utils/trpc';
import clsx from 'clsx';
import {
  Control,
  FieldValues,
  UseFormRegister,
  useWatch,
} from 'react-hook-form';
import s from './tables.module.css';

export type InvoiceOrderInput =
  InferProcedures['invoice']['create']['input']['orders'];

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    removeRow: (rowIndex: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
    control: Control<any>;
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
      {...table.options.meta?.register(`orders.${rowIdx}.${columnId}`, {
        valueAsNumber: type === 'number',
      })}
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
  columnHelper.display({
    id: 'total',
    header: 'total',
    cell: data => <TotalDisplay cellProps={data} />,
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

const TotalDisplay = ({
  cellProps,
}: {
  cellProps: CellContext<
    {
      name: string;
      amount: number;
      quantity: number;
    },
    unknown
  >;
}) => {
  const control = cellProps.table.options.meta?.control;
  const watchedOrders = useWatch({ name: 'orders', control });

  const currentRow = watchedOrders[cellProps.row.index];

  const calculatedTotalAmount =
    (currentRow?.amount ?? 0) * (currentRow?.quantity ?? 0);

  return (
    <span>{isNaN(calculatedTotalAmount) ? 0 : calculatedTotalAmount}</span>
  );
};

type OrderTableProps<T extends FieldValues> = {
  orders: InvoiceOrderInput;
  register: UseFormRegister<T>;
  control: Control<T>;
  onRemoveField: (fieldIdx: number) => void;
};

const OrderTable = <T extends FieldValues>({
  orders,
  onRemoveField,
  register,
  control,
}: OrderTableProps<T>) => {
  const table = useReactTable({
    columns,
    data: orders,
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
    meta: {
      control,
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
