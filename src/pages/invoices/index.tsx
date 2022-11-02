import StatusBadge from '@components/Invoices/StatusBadge';
import Layout from '@components/Layout';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter } from '@utils/tableHelper';
import { InferProcedures, trpc } from '@utils/trpc';
import { dayjs } from '@lib/dayjs';
import Link from 'next/link';
import {
  CheckIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';
import {
  FormEvent,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Button from '@components/Button';
import { Listbox, Transition } from '@headlessui/react';
import { InvoiceStatus } from '@prisma/client';
import useDebounce from '@hooks/useDebounce';
import usePrevious from '@hooks/usePrevious';
import { useInView } from 'react-intersection-observer';
import { DocumentPlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { capitalize } from '@utils/display';
import { calculateOrderAmount } from '@utils/invoice';
import SortableHeader from '@components/Table/SortableHeader';
import clsx from 'clsx';
import { useSetAtom } from 'jotai';
import { invoiceDrawerStateAtom } from '@components/InvoiceDrawer/NewInvoiceDrawer';
import { LoadingSpinner } from '@components/Spinner';
import { useVirtualizer } from '@tanstack/react-virtual';

type InvoiceGetAllOutput =
  InferProcedures['invoice']['infiniteInvoices']['output']['invoices'];

const columnHelper = createColumnHelper<InvoiceGetAllOutput[number]>();
const columns = [
  columnHelper.accessor('invoiceNumber', {
    header: 'No.',
    cell: props => (
      <span className="font-semibold text-xs">{`#${props.getValue()}`}</span>
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
    header: props => (
      <SortableHeader headerProps={props}>Client</SortableHeader>
    ),
    cell: props => (
      <span className="line-clamp-1">
        <span>{props.getValue()}</span>
      </span>
    ),
  }),
  columnHelper.accessor('dueDate', {
    sortingFn: 'datetime',
    header: props => (
      <SortableHeader headerProps={props}>Due Date</SortableHeader>
    ),
    cell: props => dayjs(props.getValue()).format('LL'),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: props => <StatusBadge status={props.getValue()} />,
  }),
  columnHelper.accessor('orders', {
    enableSorting: false,
    header: props => (
      <SortableHeader headerProps={props}>Amount</SortableHeader>
    ),
    cell: props => `$${calculateOrderAmount(props.getValue())}`,
  }),
  columnHelper.display({
    id: 'actions',
    cell: props => (
      <Link
        href={`/invoices/${props.row.original.id}`}
        className="text-primary font-semibold">
        View
      </Link>
    ),
  }),
];

const Invoices = () => {
  const setInvoiceDrawerOpen = useSetAtom(invoiceDrawerStateAtom);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(
    undefined
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const { ref, inView } = useInView();
  const tableParentRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 200);
  const prevQuery = usePrevious(debouncedQuery);
  const prevStatus = usePrevious(statusFilter);

  const sortValue: { [colId: string]: 'asc' | 'desc' } | undefined =
    sorting.length && sorting[0]
      ? {
          [sorting[0].id]: sorting[0].desc ? 'desc' : 'asc',
        }
      : undefined;

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
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

  const flatData = useMemo(() => {
    return data?.pages.flatMap(page => page.invoices) ?? [];
  }, [data]);

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

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => 80,
    overscan: 2,
  });
  const paddingTop =
    virtualizer.getVirtualItems().length > 0
      ? virtualizer.getVirtualItems()?.[0]?.start || 0
      : 0;
  const paddingBottom =
    virtualizer.getVirtualItems().length > 0
      ? virtualizer.getTotalSize() -
        (virtualizer.getVirtualItems()?.[
          virtualizer.getVirtualItems().length - 1
        ]?.end || 0)
      : 0;

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
    if (prevQuery === debouncedQuery) return;
    refetch();
  };

  return (
    <Layout title="Invoices">
      <h2 className="text-lg font-bold pb-6">Invoices</h2>
      <div className="w-full flex items-center pb-6">
        <form
          onSubmit={onSearch}
          className="relative flex items-center gap-4 w-80">
          <MagnifyingGlassIcon className="absolute text-gray-500 aspect-square z-20 h-5 left-2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="search"
            id="query"
            placeholder="search for client, invoice number, or projects"
            className="rounded-md text-sm border-gray-300 placeholder:text-gray-400 w-full pl-9"
            required
            autoComplete="off"
          />
        </form>
        {/* FILTER */}
        <Listbox onChange={setStatusFilter} value={statusFilter}>
          <div className="relative ml-8">
            <Listbox.Button as={Fragment}>
              <Button variant="outline" Icon={FunnelIcon}>
                {statusFilter === undefined
                  ? 'All Status'
                  : capitalize(statusFilter)}
              </Button>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              <Listbox.Options className="absolute bottom-0 p-1 w-full translate-y-full bg-white z-20 shadow-lg rounded-md">
                {Object.values({ ALL_STATUS: undefined, ...InvoiceStatus }).map(
                  status => {
                    return (
                      <Listbox.Option
                        as={Fragment}
                        key={status ?? 'all'}
                        value={status}>
                        {({ active, selected }) => {
                          return (
                            <li
                              className={clsx(
                                active && 'bg-[#f5f7f9]',
                                'p-2 rounded-md text-sm cursor-pointer flex items-center'
                              )}>
                              <span>{capitalize(status ?? 'All Status')}</span>
                              {selected && (
                                <CheckIcon className="h-4 text-gray-700 aspect-square ml-auto" />
                              )}
                            </li>
                          );
                        }}
                      </Listbox.Option>
                    );
                  }
                )}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        {/* FILTER END */}
        <div className="ml-auto flex items-center gap-4">
          <Button Icon={DocumentArrowDownIcon} variant="outline">
            Download CSV
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
            onClick={() => setInvoiceDrawerOpen(true)}
            className="w-full p-8 flex items-center justify-center border-2 border-dashed rounded-md h-[400px] hover:cursor-pointer hover:border-gray-500 transition-all">
            <div className="flex flex-col item-center gap-2">
              <DocumentPlusIcon className="h-10 aspect-square text-gray-400" />
              <p className="text-gray-700">Add a New Invoice</p>
            </div>
          </div>
        ) : (
          <div
            ref={tableParentRef}
            className="w-full h-[550px] overflow-y-scroll rounded-sm">
            <table className="w-full ring-1 ring-gray-300">
              <thead className="border-b-[2px] border-b-gray-300 bg-[#f9fbfa] sticky top-0">
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
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: `${paddingTop}px` }} />
                  </tr>
                )}
                {virtualizer.getVirtualItems().map(virtual => {
                  const row = rows[virtual.index] as typeof rows[0];
                  return (
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
                  );
                })}
                <tr ref={ref} className="py-8 w-full "></tr>
                {paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: `${paddingBottom}px` }} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
    </Layout>
  );
};

export default Invoices;
