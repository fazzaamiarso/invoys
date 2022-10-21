import StatusBadge from '@components/Invoices/StatusBadge';
import Layout from '@components/Layout';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  HeaderContext,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter, fuzzySort } from '@utils/tableHelper';
import { InferProcedures, trpc } from '@utils/trpc';
import { dayjs } from '@lib/dayjs';
import Link from 'next/link';
import {
  ChevronUpDownIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import {
  Fragment,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Button from '@components/Button';
import { Listbox } from '@headlessui/react';
import { InvoiceStatus } from '@prisma/client';
import useDebounce from '@hooks/useDebounce';
import usePrevious from '@hooks/usePrevious';
import { useInView } from 'react-intersection-observer';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { capitalize } from '@utils/display';

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
      <SortableHeader headerProps={props}>Client</SortableHeader>
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
      <SortableHeader headerProps={props}>Due Date</SortableHeader>
    ),
    cell: props => dayjs(props.getValue()).format('LL'),
  }),
  columnHelper.accessor('orders', {
    enableSorting: false,
    header: props => (
      <SortableHeader headerProps={props}>Amount</SortableHeader>
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

const SortableHeader = ({
  headerProps,
  children,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
PropsWithChildren<{ headerProps: HeaderContext<any, any> }>) => {
  return (
    <span className="flex items-center">
      <span>{children}</span>
      <button
        className=""
        onClick={headerProps.column.getToggleSortingHandler()}>
        <ChevronUpDownIcon
          className={clsx(
            'w-4 aspect-square ml-1',
            headerProps.column.getIsSorted() && 'text-purple-500'
          )}
        />
      </button>
    </span>
  );
};

const Invoices = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(
    undefined
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableParentRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 200);
  const prevQuery = usePrevious(debouncedQuery);
  const prevStatus = usePrevious(statusFilter);

  const sortValue =
    sorting.length && sorting[0]
      ? {
          [sorting[0].id]: sorting[0]?.desc ? 'desc' : 'asc',
        }
      : undefined;

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.invoice.infiniteInvoices.useInfiniteQuery(
    {
      status: statusFilter,
      query: debouncedQuery,
      sort: sortValue,
    },
    {
      refetchOnMount: false,
      keepPreviousData: true,
      enabled: prevStatus !== statusFilter || Boolean(sorting.length) || false,
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );

  const { ref, inView } = useInView();

  const flatData = useMemo(() => {
    return data?.pages.flatMap(page => page.invoices) ?? [];
  }, [data]);

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
    data: flatData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: { fuzzy: fuzzyFilter },
    manualSorting: true,
  });

  return (
    <Layout title="Invoices">
      <h2 className="text-lg font-bold pb-6">Invoices</h2>
      <div className="w-full flex items-center pb-6">
        <form
          onSubmit={e => {
            if (prevQuery === debouncedQuery) return;
            e.preventDefault();
            refetch();
          }}
          className="flex items-center gap-4 w-80">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="search"
            id="query"
            placeholder="search for client, invoice number, or projects"
            className="rounded-md text-sm border-gray-300 placeholder:text-gray-400 w-full"
            required
            autoComplete="off"
          />
          <button type="submit" className="">
            <MagnifyingGlassIcon className="h-4" />{' '}
          </button>
        </form>
        {/* FILTER */}
        <Listbox onChange={setStatusFilter} value={statusFilter}>
          <div className="relative ml-8">
            <Listbox.Button as={Fragment}>
              <Button variant="outline" Icon={FunnelIcon}>
                {statusFilter ? capitalize(statusFilter) : 'All Status'}
              </Button>
            </Listbox.Button>
            <Listbox.Options className="absolute bottom-0 py-1 w-full translate-y-full bg-white z-20 shadow-lg rounded-md">
              <Listbox.Option
                value={undefined}
                className="px-3 py-2 text-sm cursor-pointer">
                All Status
              </Listbox.Option>
              {Object.values(InvoiceStatus).map(status => {
                return (
                  <Listbox.Option
                    key={status}
                    value={status}
                    className="py-2 px-3 text-sm cursor-pointer">
                    {capitalize(status)}
                  </Listbox.Option>
                );
              })}
            </Listbox.Options>
          </div>
        </Listbox>
        {/* FILTER END */}
        <div className="ml-auto flex items-center gap-4">
          <Button Icon={DocumentArrowDownIcon} variant="outline">
            Download CSV
          </Button>
        </div>
      </div>
      {!isLoading && (
        <div
          ref={tableParentRef}
          className="w-full h-[550px] overflow-y-scroll rounded-sm">
          <table className="w-full ring-1 ring-gray-300">
            <thead className="border-b-[2px] border-b-gray-300 bg-[#f9fbfa]">
              <tr className="">
                {table.getFlatHeaders().map(header => (
                  <th
                    key={header.id}
                    scope="col"
                    className="text-start px-4 p-3 text-sm first:w-[12%]">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-t-[1px] border-gray-200">
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
              ))}
              <tr ref={ref} className="h-4 w-full "></tr>
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Invoices;
