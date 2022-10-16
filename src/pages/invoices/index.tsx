import StatusBadge from '@components/Invoices/StatusBadge';
import Layout from '@components/Layout';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter } from '@utils/tableHelper';
import { InferProcedures, trpc } from '@utils/trpc';
import { dayjs } from '@lib/dayjs';
import Link from 'next/link';

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
    header: 'Client',
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
    header: 'Due Date',
    cell: props => dayjs(props.getValue()).format('LL'),
  }),
  columnHelper.accessor('orders', {
    header: 'Amount',
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
  const { data: invoices } = trpc.invoice.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const table = useReactTable({
    columns,
    data: invoices ?? [],
    getCoreRowModel: getCoreRowModel(),
    filterFns: { fuzzy: fuzzyFilter },
  });

  return (
    <Layout title="Invoices">
      <h2 className="text-2xl font-bold pb-6">Invoices</h2>
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
