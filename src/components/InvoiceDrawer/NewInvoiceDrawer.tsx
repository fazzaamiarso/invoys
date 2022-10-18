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

type NewInvoiceInput = InferProcedures['invoice']['create']['input'];

export const invoiceDrawerStateAtom = atom(false);

export const NewInvoiceDrawer = () => {
  const [isOpen, setIsOpen] = useAtom(invoiceDrawerStateAtom);
  const router = useRouter();

  const { register, handleSubmit, reset, control } = useForm<NewInvoiceInput>({
    defaultValues: {
      orders: [{ amount: 300, quantity: 1, name: 'Company Profile' }],
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
      return utils.invoice.getAll.invalidate();
    },
  });

  const onSubmit: SubmitHandler<NewInvoiceInput> = async fieldValues => {
    if (!fieldValues.recipientEmail) return;
    mutation.mutate({
      ...fieldValues,
      recipientEmail: fieldValues.recipientEmail,
    });
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
