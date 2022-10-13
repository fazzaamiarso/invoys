import Button from '@components/Button';
import TextArea from '@components/Form/TextArea';
import TextInput from '@components/Form/TextInput';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Customer, OrderItem } from '@prisma/client';
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { trpc } from '@utils/trpc';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import s from './tables.module.css';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    removeRow: (rowIndex: number) => void;
  }
}

const defaultColumn: Partial<ColumnDef<OrderItem>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState(initialValue);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initialType = useRef(typeof value);

    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return (
      <input
        type={initialType.current === 'string' ? 'text' : 'number'}
        value={value as string}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        autoComplete="off"
        // className={clsx('rounded-md w-20 text-sm border-gray-400')}
        className="w-full rounded-md border-gray-400"
      />
    );
  },
};

const columnHelper = createColumnHelper<OrderItem>();
const columns = [
  columnHelper.accessor('name', {
    header: 'Item',
  }),
  columnHelper.accessor('quantity', {
    header: 'qty',
  }),
  columnHelper.accessor('amount', {
    header: 'price',
  }),
  columnHelper.accessor(row => `${row.amount * row.quantity}`, {
    header: 'total',
    cell: data => <span>{data.getValue()}</span>,
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

type FieldValues = {
  name: string;
  dueDate: string;
  issueDate: string;
  notes?: string;
  customer: string;
};

const InvoiceForm = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { register, handleSubmit } = useForm<FieldValues>();
  const mutation = trpc.invoice.create.useMutation({
    onSuccess: data => {
      utils.invoice.getAll.invalidate();
      router.push(`/invoices/${data.id}`);
      onClose();
    },
  });

  const [selectedRecipient, setSelectedRecipient] = useState<Customer | null>(
    null
  );
  const [data, setData] = useState<OrderItem[]>([
    {
      id: '1',
      name: 'Landing page',
      amount: 750,
      quantity: 3,
      createdAt: new Date(),
      invoiceId: '1',
    },
  ]);
  const table = useReactTable({
    columns,
    data,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
      removeRow: rowIndex =>
        setData(old => old.filter((_, index) => index !== rowIndex)),
    },
  });
  const onSubmit: SubmitHandler<FieldValues> = async fieldValues => {
    if (!selectedRecipient?.id) return;
    mutation.mutate({
      ...fieldValues,
      recipientId: selectedRecipient.id,
      orders: data,
    });
    // console.table(fieldValues);
    // console.log(data);
  };

  const totalAmount = data.reduce(
    (acc, currOrder) => acc + currOrder.amount * currOrder.quantity,
    0
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <RecipientCombobox
        selectedRecipient={selectedRecipient}
        setSelectedRecipient={setSelectedRecipient}
      />
      <TextInput
        name="name"
        label="Project / Description"
        register={register}
      />
      <div className="flex gap-6">
        <TextInput
          name="issueDate"
          label="Issued on"
          type="date"
          register={register}
        />
        <TextInput
          name="dueDate"
          label="Due on"
          type="date"
          register={register}
        />
      </div>
      {/* TABLE */}
      <div className="w-full">
        <table
          className={clsx(
            s['order-table'],
            'w-full table-fixed border-collapse'
          )}>
          <thead className="">
            <tr className="">
              {table.getFlatHeaders().map(header => (
                <th key={header.id} scope="col" className="">
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
                      <td key={cell.id} className="">
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
        {/* TABLE END */}
        <div className="w-full flex justify-between items-center">
          <button
            type="button"
            className="text-blue-500"
            onClick={() =>
              setData(prevData => [
                ...prevData,
                {
                  id: '',
                  name: '',
                  amount: 0,
                  quantity: 0,
                  createdAt: new Date(),
                  invoiceId: '1',
                },
              ])
            }>
            + add item
          </button>
          <div>Total {totalAmount}</div>
        </div>
      </div>
      <TextArea name="notes" label="Additional notes" register={register} />
      <div className="flex items-center justify-between w-full">
        <button type="button" className="text-sm">
          PREVIEW
        </button>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
};

export default InvoiceForm;

type ComboboxProps = {
  selectedRecipient: Customer | null;
  setSelectedRecipient: Dispatch<SetStateAction<Customer | null>>;
};
const RecipientCombobox = ({
  selectedRecipient,
  setSelectedRecipient,
}: ComboboxProps) => {
  const [query, setQuery] = useState('');
  const { data: initialClients, isLoading } = trpc.customer.getAll.useQuery(
    { limit: 10, query },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (initialClients && initialClients[0]) {
      setSelectedRecipient(initialClients[0]);
    }
  }, [initialClients, setSelectedRecipient]);

  return (
    <div>
      <Combobox
        as="div"
        className="relative"
        value={selectedRecipient ?? (initialClients && initialClients[0]) ?? {}}
        onChange={setSelectedRecipient}>
        <div className="rounded-md bg-blue-100 space-y-4 p-4">
          <div className="text-sm">
            <span>Recipient Name :</span> {selectedRecipient?.name}
          </div>
          <div className="relative flex flex-col gap-2">
            <label htmlFor="rec-email" className="text-sm">
              Recipient Email
            </label>
            <Combobox.Input
              type="text"
              id="rec-email"
              autoComplete="off"
              onChange={event => setQuery(event.target.value)}
              displayValue={val =>
                selectedRecipient?.email ??
                (initialClients && initialClients[0]?.email) ??
                ''
              }
              className="rounded-md text-sm "
            />
            <Combobox.Button className="absolute inset-y-0 right-0 top-8 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
        </div>
        <Combobox.Options className="absolute z-20 w-full left-0 bottom-0 translate-y-[102%] bg-gray-200 p-2">
          {initialClients &&
            query === '' &&
            initialClients.map(c => {
              return (
                <Combobox.Option key={c.id} value={c}>
                  {c.email} - {c.name}
                </Combobox.Option>
              );
            })}
          {initialClients &&
            query &&
            initialClients.map(c => {
              return (
                <Combobox.Option key={c.id} value={c}>
                  {c.email} - {c.name}
                </Combobox.Option>
              );
            })}
          {isLoading && <span className="text-sm">Loading...</span>}
          {!isLoading && query && !initialClients?.length && (
            <span className="text-sm">No Clients Found</span>
          )}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};
