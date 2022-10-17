import Button from '@components/Button';
import TextArea from '@components/Form/TextArea';
import TextInput from '@components/Form/TextInput';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { Customer } from '@prisma/client';
import { InferProcedures, trpc } from '@utils/trpc';
import clsx from 'clsx';
import useDebounce from 'hooks/useDebounce';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
  Control,
  useWatch,
} from 'react-hook-form';
import OrderTable from './OrderTable';

export type InvoiceOrderInput =
  InferProcedures['invoice']['create']['input']['orders'];

type FieldValues = {
  name: string;
  dueDate: string;
  issuedOn: string;
  notes?: string;
  customer: string;
  selectedClient?: string;
  orders: InvoiceOrderInput;
};

const InvoiceForm = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();

  const { register, handleSubmit, reset, control } = useForm<FieldValues>({
    defaultValues: {
      orders: [{ amount: 300, quantity: 1, name: 'Company Profile' }],
    },
  });
  const { fields, append, remove } = useFieldArray<FieldValues>({
    name: 'orders',
    control,
  });

  const addOrderField = () => append({ amount: 0, quantity: 0, name: '' });
  const removeOrderField = (fieldIdx: number) => remove(fieldIdx);

  const utils = trpc.useContext();
  const mutation = trpc.invoice.create.useMutation({
    onSuccess: data => {
      router.push(`/invoices/${data.id}`);
      reset();
      onClose();
      return utils.invoice.getAll.invalidate();
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async fieldValues => {
    console.log(fieldValues.selectedClient);
    if (!fieldValues.selectedClient) return;
    mutation.mutate({
      ...fieldValues,
      recipientEmail: fieldValues.selectedClient,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Controller
        name="selectedClient"
        control={control}
        render={({ field }) => {
          return (
            <RecipientCombobox
              selectedClient={field.value}
              onSelectClient={field.onChange}
            />
          );
        }}
      />

      <TextInput
        name="name"
        label="Project / Description"
        register={register}
      />
      <div className="flex gap-8 w-full">
        <TextInput
          name="issuedOn"
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
        <OrderTable
          orders={fields}
          onRemoveField={removeOrderField}
          register={register}
        />
        <div className="w-full flex justify-between items-center pt-2">
          <button
            type="button"
            className="text-blue-500 text-xs font-semibold"
            onClick={addOrderField}>
            + ADD ITEM
          </button>
          <TotalAmount control={control} />
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
  selectedClient?: string;
  onSelectClient: (value: string) => void;
};
const RecipientCombobox = ({
  selectedClient,
  onSelectClient,
}: ComboboxProps) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const { data: searchedClients } = trpc.customer.search.useQuery(
    { query: debouncedQuery },
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(debouncedQuery),
      keepPreviousData: true,
    }
  );

  const { data: initialClients } = trpc.customer.getAll.useQuery(
    { limit: 10 },
    {
      refetchOnWindowFocus: false,
      enabled: debouncedQuery === '',
      staleTime: Infinity,
      onSuccess: data => data[0] && onSelectClient(data[0].email),
    }
  );

  const selectedClientEmail =
    selectedClient ?? (initialClients && initialClients[0]?.email) ?? '';

  return (
    <div>
      <Combobox
        as="div"
        className="relative"
        value={selectedClientEmail}
        onChange={onSelectClient}>
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
                displayValue={() => selectedClientEmail}
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
              {debouncedQuery === '' &&
                initialClients?.map(c => <EmailOption key={c.id} client={c} />)}
              {debouncedQuery &&
                searchedClients?.map(c => (
                  <EmailOption key={c.id} client={c} />
                ))}
              {searchedClients?.length === 0 && debouncedQuery && (
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
    <Combobox.Option
      key={client.id}
      value={client.email}
      className="w-full text-sm">
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

const TotalAmount = ({ control }: { control: Control<FieldValues> }) => {
  const watchedOrders = useWatch({ name: 'orders', control });

  const totalAmount = watchedOrders.reduce(
    (acc, currOrder) => acc + currOrder.amount * currOrder.quantity,
    0
  );

  return (
    <div className="space-x-2">
      <span className="text-sm">Total</span>
      <span className="font-semibold text-lg">${totalAmount}</span>
    </div>
  );
};
