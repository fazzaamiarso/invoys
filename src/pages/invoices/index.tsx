import StatusBadge from '@components/Invoices/StatusBadge';
import Layout from '@components/Layout';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter, fuzzySort, orderTotalSort } from '@utils/tableHelper';
import { InferProcedures, trpc } from '@utils/trpc';
import { dayjs } from '@lib/dayjs';
import Link from 'next/link';
import {
  ChevronUpDownIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useState } from 'react';
import Button from '@components/Button';

type InvoiceGetAllOutput = InferProcedures['invoice']['getAll']['output'];

const columnHelper = createColumnHelper<InvoiceGetAllOutput[number]>();
const columns = [
  columnHelper.accessor('invoiceNumber', {
    header: 'No.',
    cell: props => (
      <span className="font-semibold">{`#${props.getValue()}`}</span>
    ),
  }),
  columnHelper.accessor('name', {
    header: 'Project Name',
    cell: props => (
      <span className="line-clamp-1">
        <span>{props.getValue()}</span>
      </span>
    ),
  }),
  columnHelper.accessor('customer.name', {
    sortingFn: fuzzySort,
    header: props => (
      <span className="flex items-center">
        <span>Client</span>
        <button className="" onClick={props.column.getToggleSortingHandler()}>
          <ChevronUpDownIcon
            className={clsx(
              'w-4 aspect-square ml-1',
              props.column.getIsSorted() && 'text-purple-500'
            )}
          />
        </button>
      </span>
    ),
    cell: props => (
      <span className="line-clamp-1">
        <span>{props.getValue()}</span>
      </span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: props => <StatusBadge status={props.getValue()} />,
  }),
  columnHelper.accessor('dueDate', {
    sortingFn: 'datetime',
    header: props => (
      <span className="flex items-center">
        <span>Due Date</span>
        <button className="" onClick={props.column.getToggleSortingHandler()}>
          <ChevronUpDownIcon
            className={clsx(
              'w-4 aspect-square ml-1',
              props.column.getIsSorted() && 'text-purple-500'
            )}
          />
        </button>
      </span>
    ),
    cell: props => dayjs(props.getValue()).format('LL'),
  }),
  columnHelper.accessor('orders', {
    sortingFn: orderTotalSort,
    header: props => (
      <span className="flex items-center">
        <span>Amount</span>
        <button className="" onClick={props.column.getToggleSortingHandler()}>
          <ChevronUpDownIcon
            className={clsx(
              'w-4 aspect-square ml-1',
              props.column.getIsSorted() && 'text-purple-500'
            )}
          />
        </button>
      </span>
    ),
    cell: props =>
      `$${props
        .getValue()
        .reduce(
          (acc, currOrder) => acc + currOrder.amount * currOrder.quantity,
          0
        )}`,
  }),
  columnHelper.display({
    id: 'actions',
    cell: props => (
      <Link
        href={`/invoices/${props.row.original.id}`}
        className="underline text-blue-500">
        See Details
      </Link>
    ),
  }),
];

const Invoices = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  const { data: invoices } = trpc.invoice.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const table = useReactTable({
    columns,
    data: invoices ?? [],
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: { fuzzy: fuzzyFilter },
  });

  return (
    <Layout title="Invoices">
      <h2 className="text-2xl font-bold pb-6">Invoices</h2>
      <div className="w-full flex items-center pb-6">
        <form
          onSubmit={e => e.preventDefault()}
          className="flex items-center gap-4">
          <input
            type="search"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            name="filterClient"
            id="filterClient"
            placeholder="search for client, invoice number, or projects"
            className="rounded-md text-sm border-gray-300 placeholder:text-gray-400"
          />
          <button className="">
            <MagnifyingGlassIcon className="h-4" />{' '}
          </button>
        </form>
        <div className="ml-auto flex items-center gap-4">
          <Button Icon={DocumentArrowDownIcon} variant="outline">
            Download CSV
          </Button>
        </div>
      </div>
      <table className="w-full ring-1 ring-gray-300 rounded-sm">
        <thead className="border-b-2 border-b-gray-300">
          <tr className="">
            {table.getFlatHeaders().map(header => (
              <th
                key={header.id}
                scope="col"
                className="text-start px-4 p-2 text-sm first:w-[12%]">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
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
                    <td key={cell.id} className="p-4 py-4 text-sm">
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
    </Layout>
  );
};

export default Invoices;
