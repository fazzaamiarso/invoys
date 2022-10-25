import Button from '@components/Button';
import Layout from '@components/Layout';
import NewClientDrawer from '@components/NewClientDrawer';
import { LoadingSpinner } from '@components/Spinner';
import SortableHeader from '@components/Table/SortableHeader';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import {
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
import { fuzzyFilter } from '@utils/tableHelper';
import { trpc } from '@utils/trpc';
import { NextPage } from 'next';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const columnHelper = createColumnHelper<Customer>();
const columns = [
  columnHelper.accessor('invoicePrefix', {
    header: 'Prefix',
  }),
  columnHelper.accessor('name', {
    header: props => <SortableHeader headerProps={props}>Name</SortableHeader>,
    cell: props => props.getValue(),
  }),
  columnHelper.accessor('email', {
    header: props => <SortableHeader headerProps={props}>Email</SortableHeader>,
  }),
  columnHelper.accessor('phoneNumber', {
    header: 'Phone Number',
  }),
  columnHelper.display({
    id: 'actions',
    cell: props => (
      <Link
        href={`/clients/${props.row.original.id}`}
        className="font-semibold">
        View
      </Link>
    ),
  }),
];

const ClientsIndex: NextPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView();

  const debouncedQuery = useDebounce(query, 300);
  const sort: { [colId: string]: 'asc' | 'desc' } | undefined =
    sorting.length && sorting[0]
      ? {
          [sorting[0].id]: sorting[0].desc ? 'desc' : 'asc',
        }
      : undefined;

  const {
    data: clients,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = trpc.customer.infiniteClients.useInfiniteQuery(
    {
      query: debouncedQuery,
      sort,
    },
    {
      keepPreviousData: true,
      enabled: Boolean(sorting.length) || false,
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );

  const flatData = useMemo(
    () => clients?.pages.flatMap(pages => pages.customer) ?? [],
    [clients]
  );

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

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    refetch();
  };

  return (
    <Layout title="Clients">
      <div className="flex gap-4 items-center pb-6">
        <h2 className="font-semibold text-lg">Clients</h2>
      </div>
      <section className="w-full space-y-6">
        <div className="w-full flex items-center">
          <form
            onSubmit={onSearch}
            className="relative flex items-center gap-4 w-80">
            <MagnifyingGlassIcon className="absolute text-gray-500 aspect-square z-20 h-5 left-2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              type="search"
              id="query"
              required
              autoComplete="off"
              placeholder="search for client, invoice number, or projects"
              className="rounded-md text-sm border-gray-300 placeholder:text-gray-400 w-full pl-9"
            />
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
        {status === 'loading' && (
          <div className="w-full flex items-center justify-center pt-28">
            <LoadingSpinner twWidth="w-20" />
          </div>
        )}
        {status !== 'loading' &&
          (table.getRowModel().rows.length === 0 ? (
            <div
              onClick={() => setIsDrawerOpen(true)}
              className="w-full p-8 flex items-center justify-center border-2 border-dashed rounded-md h-[400px] hover:cursor-pointer hover:border-gray-500 transition-all">
              <div className="flex flex-col item-center gap-2">
                <UserPlusIcon className="h-10 aspect-square text-gray-400" />
                <p className="text-gray-700">Add a New Client</p>
              </div>
            </div>
          ) : (
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
                      <tr
                        key={row.id}
                        className="border-t-[1px] border-gray-200">
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
          ))}
      </section>
      <NewClientDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </Layout>
  );
};

export default ClientsIndex;
