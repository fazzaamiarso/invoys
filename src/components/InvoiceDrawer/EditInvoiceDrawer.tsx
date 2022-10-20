import Button from '@components/Button';
import Drawer from '@components/Drawer';
import TextArea from '@components/Form/TextArea';
import TextInput from '@components/Form/TextInput';
import OrderTable from './OrderTable';
import { InferProcedures, trpc } from '@utils/trpc';
import dayjs from 'dayjs';
import {
  Control,
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { RecipientCombobox } from './RecipientCombobox';

export type InvoiceGetSingleOutput =
  InferProcedures['invoice']['getSingle']['output'];

type EditInvoiceInput = InferProcedures['invoice']['edit']['input'];

export const EditInvoiceDrawer = ({
  invoiceDetails,
  isOpen,
  onClose,
}: {
  invoiceDetails: NonNullable<InvoiceGetSingleOutput>;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<EditInvoiceInput>({
    defaultValues: {
      ...invoiceDetails,
      dueDate: dayjs(invoiceDetails.dueDate).format('YYYY-MM-DD'),
      issuedOn: dayjs(invoiceDetails.issuedOn).format('YYYY-MM-DD'),
      notes: invoiceDetails.notes ?? '',
      recipientEmail: invoiceDetails.customer.email,
      orders: [{ amount: 0, quantity: 0, name: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray<EditInvoiceInput>({
    name: 'orders',
    control,
  });

  const addOrderField = () => append({ amount: 0, quantity: 0, name: '' });
  const removeOrderField = (fieldIdx: number) => remove(fieldIdx);

  const utils = trpc.useContext();
  const mutation = trpc.invoice.edit.useMutation({
    onSuccess: data => {
      onClose();
      utils.invoice.getSingle.invalidate({ invoiceId: data.id });
      return utils.invoice.getAll.invalidate();
    },
  });

  const onSubmit: SubmitHandler<EditInvoiceInput> = async fieldValues => {
    if (!isDirty) return onClose();
    if (!fieldValues.recipientEmail) return;
    mutation.mutate({
      ...fieldValues,
      invoiceId: invoiceDetails.id,
    });
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Edit Invoice">
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
            control={control}
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
            loadingContent="Saving changes...">
            Save changes
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

const TotalAmount = ({ control }: { control: Control<EditInvoiceInput> }) => {
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
