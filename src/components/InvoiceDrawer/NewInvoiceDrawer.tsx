import Button from '@components/Button';
import Drawer from '@components/Drawer';
import TextArea from '@components/Form/TextArea';
import TextInput from '@components/Form/TextInput';
import OrderTable from './OrderTable';
import { InferProcedures, trpc } from '@utils/trpc';
import { atom, useAtom } from 'jotai';
import { useRouter } from 'next/router';
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Controller,
  Control,
  useWatch,
} from 'react-hook-form';
import { RecipientCombobox } from './RecipientCombobox';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';
import { Fragment } from 'react';

type NewInvoiceInput = InferProcedures['invoice']['create']['input'];

export const invoiceDrawerStateAtom = atom(false);

export const NewInvoiceDrawer = () => {
  const [isOpen, setIsOpen] = useAtom(invoiceDrawerStateAtom);
  const router = useRouter();

  const { register, handleSubmit, reset, control } = useForm<NewInvoiceInput>({
    defaultValues: {
      isDraft: false,
      orders: [{ amount: 0, quantity: 1, name: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray<NewInvoiceInput>({
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
      setIsOpen(false);
      return utils.invoice.infiniteInvoices.invalidate();
    },
  });

  const onSubmit: SubmitHandler<NewInvoiceInput> = async fieldValues => {
    if (!fieldValues.recipientEmail) return;
    mutation.mutate(fieldValues);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Create Invoice">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Controller
          name="recipientEmail"
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
            control={control}
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
          <Controller
            control={control}
            name="isDraft"
            render={({ field }) => (
              <Switch.Group>
                <div className="flex items-center gap-2">
                  <Switch.Label className="text-sm">Save as draft</Switch.Label>
                  <Switch
                    as={Fragment}
                    checked={field.value}
                    onChange={field.onChange}>
                    {({ checked }) => (
                      <button
                        className={clsx(
                          checked ? 'bg-pink-500' : 'bg-[#e4e7eb]',
                          'relative inline-flex h-[24px] w-[48px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75'
                        )}>
                        <span
                          aria-hidden="true"
                          className={`${
                            checked ? 'translate-x-[24px]' : 'translate-x-0'
                          }
                  pointer-events-none inline-block aspect-square h-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                    )}
                  </Switch>
                </div>
              </Switch.Group>
            )}
          />

          <Button
            type="submit"
            isLoading={mutation.isLoading}
            loadingContent="Creating invoice...">
            Create invoice
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

const TotalAmount = ({ control }: { control: Control<NewInvoiceInput> }) => {
  const watchedOrders = useWatch({ name: 'orders', control });

  const totalAmount = watchedOrders.reduce(
    (acc, currOrder) => acc + currOrder.amount * currOrder.quantity,
    0
  );

  return (
    <div className="space-x-2">
      <span className="text-sm">Total</span>
      <span className="font-semibold text-lg">
        ${isNaN(totalAmount) ? 0 : totalAmount}
      </span>
    </div>
  );
};
