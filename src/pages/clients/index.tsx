import Button from '@components/Button';
import Layout from '@components/Layout';
import NewClientDrawer from '@components/NewClientDrawer';
import {
  ChevronUpDownIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { Customer } from '@prisma/client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter } from '@utils/tableHelper';
import { trpc } from '@utils/trpc';
import clsx from 'clsx';
import { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';

const columnHelper = createColumnHelper<Customer>();
const columns = [
  columnHelper.accessor('name', {
    header: props => (
      <span className="flex items-center">
        <span>Name</span>
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
      <Link href={`clients/${props.cell.row.original.id}`}>
        {props.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('invoicePrefix', {
    header: 'Prefix',
  }),
  columnHelper.accessor('email', {
    header: props => (
      <span className="flex items-center">
        <span>Email</span>
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
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Phone Number',
  }),
];

const ClientsIndex: NextPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: clients } = trpc.customer.getAll.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy',
    filterFns: { fuzzy: fuzzyFilter },
    data: clients ?? [],
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Layout title="Clients">
      <div className="flex gap-4 items-center pb-12">
        <h2 className="font-semibold text-2xl">Clients</h2>
      </div>
      <section className="w-full space-y-6">
        <div className="w-full flex items-center">
          <form
            onSubmit={e => e.preventDefault()}
            className="flex items-center gap-4">
            <input
              type="search"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              name="filterClient"
              id="filterClient"
              placeholder="search for client"
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
            <Button Icon={PlusIcon} onClick={() => setIsDrawerOpen(true)}>
              Add Client
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
                  className="text-start p-2 text-sm">
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
                      <td key={cell.id} className="p-2 text-sm">
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
      </section>
      <NewClientDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </Layout>
  );
};

export default ClientsIndex;
