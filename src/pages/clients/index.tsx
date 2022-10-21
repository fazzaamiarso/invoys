import Button from '@components/Button';
import Layout from '@components/Layout';
import NewClientDrawer from '@components/NewClientDrawer';
import {
  ChevronUpDownIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import useDebounce from '@hooks/useDebounce';
import { Customer } from '@prisma/client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter, fuzzySort } from '@utils/tableHelper';
import { trpc } from '@utils/trpc';
import clsx from 'clsx';
import { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const columnHelper = createColumnHelper<Customer>();
const columns = [
  columnHelper.accessor('invoicePrefix', {
    header: 'Prefix',
  }),
  columnHelper.accessor('name', {
    sortingFn: fuzzySort,
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
    cell: props => props.getValue(),
  }),
  columnHelper.accessor('email', {
    sortingFn: fuzzySort,
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
  columnHelper.display({
    id: 'actions',
    cell: props => (
      <Link
        href={`/clients/${props.row.original.id}`}
        className="underline text-blue-500">
        See Details
      </Link>
    ),
  }),
];

const ClientsIndex: NextPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const [sorting, setSorting] = useState<SortingState>([]);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView();

  const {
    data: clients,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.customer.infiniteClients.useInfiniteQuery(
    {
      query: debouncedQuery,
      sort: sorting.length
        ? {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            [sorting[0]!.id]: sorting[0]?.desc ? 'desc' : 'asc',
          }
        : undefined,
    },
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      enabled: Boolean(sorting) || false,
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );

  const flatData = useMemo(
    () => clients?.pages.flatMap(pages => pages.customer) ?? [],
    [clients]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const table = useReactTable({
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    filterFns: { fuzzy: fuzzyFilter },
    data: flatData,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <Layout title="Clients">
      <div className="flex gap-4 items-center pb-6">
        <h2 className="font-semibold text-lg">Clients</h2>
      </div>
      <section className="w-full space-y-6">
        <div className="w-full flex items-center">
          <form
            onSubmit={e => {
              e.preventDefault();
              refetch();
            }}
            className="flex items-center gap-4 w-80">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              name="searchClient"
              id="searchClient"
              required
              placeholder="search for name, prefix, or email"
              className="rounded-md text-sm border-gray-300 placeholder:text-gray-400 w-full"
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
        <div
          ref={tableContainerRef}
          className="w-full h-[550px] overflow-y-scroll rounded-sm">
          <table className="w-full ring-1 ring-gray-300 rounded-sm">
            <thead className="border-b-[2px] border-b-gray-300 bg-[#f9fbfa]">
              <tr className="">
                {table.getFlatHeaders().map(header => (
                  <th
                    key={header.id}
                    scope="col"
                    className="text-start p-4 text-sm">
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
                  <tr key={row.id} className="border-t-[1px] border-gray-200">
                    {row.getVisibleCells().map(cell => {
                      return (
                        <td key={cell.id} className="p-4  text-sm">
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
              <tr ref={ref} className="h-4 w-full"></tr>
            </tbody>
          </table>
        </div>
      </section>
      <NewClientDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </Layout>
  );
};

export default ClientsIndex;
