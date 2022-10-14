import Button from '@components/Button';
import TextArea from '@components/Form/TextArea';
import TextInput from '@components/Form/TextInput';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { Customer } from '@prisma/client';
import { InferProcedures, trpc } from '@utils/trpc';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import OrderTable from './OrderTable';

type FieldValues = {
  name: string;
  dueDate: string;
  issueDate: string;
  notes?: string;
  customer: string;
};

export type InvoiceOrderInput =
  InferProcedures['invoice']['create']['input']['orders'];

const InvoiceForm = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { register, handleSubmit, reset } = useForm<FieldValues>();
  const mutation = trpc.invoice.create.useMutation({
    onSuccess: data => {
      utils.invoice.getAll.invalidate();
      router.push(`/invoices/${data.id}`);
      reset();
      onClose();
    },
  });

  const [selectedRecipient, setSelectedRecipient] = useState<Customer | null>(
    null
  );
  const [data, setData] = useState<InvoiceOrderInput>([
    {
      name: 'Landing page',
      amount: 750,
      quantity: 3,
    },
  ]);

  const onSubmit: SubmitHandler<FieldValues> = async fieldValues => {
    if (!selectedRecipient?.id) return;
    mutation.mutate({
      ...fieldValues,
      recipientId: selectedRecipient.id,
      orders: data,
    });
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
      <div className="flex gap-8 w-full">
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
      <div className="w-full">
        <OrderTable orderData={data} setOrderData={setData} />
        <div className="w-full flex justify-between items-center pt-2">
          <button
            type="button"
            className="text-blue-500 text-xs font-semibold"
            onClick={() =>
              setData(prevData => [
                ...prevData,
                {
                  name: '',
                  amount: 0,
                  quantity: 0,
                },
              ])
            }>
            + ADD ITEM
          </button>
          <div className="space-x-2">
            <span className="text-sm">Total</span>
            <span className="font-semibold text-lg">${totalAmount}</span>
          </div>
        </div>
      </div>
      <TextArea name="notes" label="Additional notes" register={register} />
      <div className="flex items-center justify-between w-full border-t-[1px] border-t-gray-300 py-4">
        <button type="button" className="text-sm">
          PREVIEW
        </button>
        <Button
          type="submit"
          isLoading={mutation.isLoading}
          loadingContent="Creating invoice...">
          Create invoice
        </Button>
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
  const debouncedQuery = useDebounce(query, 500);
  const { data: initialClients, isLoading } = trpc.customer.getAll.useQuery(
    { limit: 10, query: debouncedQuery },
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
        <div className="rounded-md bg-blue-50 ring-1 ring-blue-200 space-y-4 p-4">
          <div className="relative w-full">
            <div className="relative flex flex-col gap-2">
              <label
                htmlFor="rec-email"
                className="text-gray-600 font-semibold">
                Recipient Email
              </label>
              <Combobox.Input
                type="text"
                id="rec-email"
                autoComplete="off"
                onChange={event => setQuery(event.target.value)}
                displayValue={_ =>
                  selectedRecipient?.email ??
                  (initialClients && initialClients[0]?.email) ??
                  ''
                }
                className="rounded-sm text-sm border-gray-300 text-gray-700"
              />
              <Combobox.Button className="absolute inset-y-0 right-0 top-8 flex items-center px-3">
                <ChevronDownIcon
                  className="h-5 aspect-square text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-20 w-full rounded-md left-0 py-1 -bottom-1 translate-y-[100%] bg-white shadow-md">
              {initialClients &&
                query === '' &&
                initialClients.map(c => <EmailOption key={c.id} client={c} />)}
              {initialClients &&
                query &&
                initialClients.map(c => <EmailOption key={c.id} client={c} />)}
              {isLoading && (
                <div className="text-sm p-2">Searching clients...</div>
              )}
              {!isLoading && query && !initialClients?.length && (
                <div className="text-sm p-2">No Clients Found</div>
              )}
            </Combobox.Options>
          </div>
        </div>
      </Combobox>
    </div>
  );
};

type OptionProps = {
  client: Customer;
};
const EmailOption = ({ client }: OptionProps) => {
  return (
    <Combobox.Option key={client.id} value={client} className="w-full text-sm">
      {({ active, selected }) => {
        return (
          <div className={clsx('w-full py-2', active && 'bg-pink-100')}>
            <div className="flex items-center px-2">
              {!selected && (
                <div className="h-4 pr-2 bg-transparent aspect-square" />
              )}
              {selected && <CheckIcon className="h-4 pr-2" />} {client.email} (
              {client.name})
            </div>
          </div>
        );
      }}
    </Combobox.Option>
  );
};

const useDebounce = <T,>(val: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(val);

  useEffect(() => {
    const timerHandler = setTimeout(() => {
      setDebouncedValue(val);
    }, delay);
    return () => clearTimeout(timerHandler);
  }, [val, delay]);

  return debouncedValue;
};
