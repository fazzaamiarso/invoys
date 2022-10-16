/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Button from '@components/Button';
import Layout from '@components/Layout';
import NewClientDrawer from '@components/NewClientDrawer';
import {
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { Customer } from '@prisma/client';
import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils';
import {
  createColumnHelper,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingFn,
  sortingFns,
  useReactTable,
} from '@tanstack/react-table';
import { trpc } from '@utils/trpc';
import { NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
//   let dir = 0;

//   // Only sort by rank if the column has ranking information
//   if (rowA.columnFiltersMeta[columnId]) {
//     dir = compareItems(
//       rowA.columnFiltersMeta[columnId]?.itemRank!,
//       rowB.columnFiltersMeta[columnId]?.itemRank!
//     );
//   }

//   // Provide an alphanumeric fallback for when the item ranks are equal
//   return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
// };

const columnHelper = createColumnHelper<Customer>();
const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
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
    header: 'Email',
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Phone Number',
  }),
];

const ClientsIndex: NextPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: clients } = trpc.customer.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

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
