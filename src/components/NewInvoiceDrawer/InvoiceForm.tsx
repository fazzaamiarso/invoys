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
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

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

    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return (
      <input
        type={typeof value === 'string' ? 'text' : 'number'}
        value={value as string}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        className="w-20"
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
  dueDate: Date;
  notes?: string;
  currency: string;
  customer: string;
};

const InvoiceForm = () => {
  const { register, handleSubmit } = useForm<FieldValues>();

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
    // const mutation = trpc.invoice.create.useMutation();
    // mutation.mutate({ ...fieldValues, recipientId: '1', orders: data });
    console.table(fieldValues);
    console.log(data);
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
      <TextInput name="customer" label="Recipient" register={register} />
      <TextInput name="name" label="Project/Description" register={register} />
      <TextInput name="dueDate" label="Due on" register={register} />
      {/* TABLE */}
      <div className="w-full">
        <table className="w-full">
          <thead className="">
            <tr>
              {table.getFlatHeaders().map(header => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id}>
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
  const { data: initialClients } = trpc.customer.getAll.useQuery(
    { limit: 10 },
    { refetchOnWindowFocus: false }
  );
  // const { data: searchedClients } = trpc.customer.getAll.useQuery(
  //   {
  //     limit: 10,
  //     query,
  //   },
  //   { refetchOnWindowFocus: false }
  // );

  useEffect(() => {
    if (initialClients && initialClients[0]) {
      setSelectedRecipient(initialClients[0]);
    }
  }, [initialClients, setSelectedRecipient]);

  return (
    <div>
      <div>
        <span>Recipient Name :</span> {selectedRecipient?.name}
      </div>
      <Combobox
        as="div"
        className="relative"
        value={selectedRecipient ?? (initialClients && initialClients[0]) ?? {}}
        onChange={setSelectedRecipient}>
        <div className="relative">
          <div className="flex flex-col gap-2">
            <label htmlFor="rec-email">Recipient Email</label>
            <Combobox.Input
              type="text"
              id="rec-email"
              onChange={event => setQuery(event.target.value)}
              displayValue={val => selectedRecipient?.email || ''}
            />
          </div>
          <Combobox.Button className="absolute inset-y-0 right-0 top-8 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute w-full left-0 bottom-0 translate-y-[102%] bg-gray-200 p-2">
          {initialClients &&
            query === '' &&
            initialClients.map(c => {
              return (
                <Combobox.Option key={c.id} value={c}>
                  {c.email} - {c.name}
                </Combobox.Option>
              );
            })}
          {/* {data &&
            data.map(person => (
              <Combobox.Option key={person} value={person}>
                {person}
              </Combobox.Option>
            ))} */}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};
