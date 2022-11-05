import { InferProcedures, trpc } from '@utils/trpc';
import { SubmitHandler, useForm } from 'react-hook-form';
import Button from '../Button';
import Drawer from '../Drawer';
import TextInput from '../Form/TextInput';

export type CustomerDetailOutput = NonNullable<
  InferProcedures['customer']['getSingle']['output']
>;

type Props = {
  onClose: () => void;
  isOpen: boolean;
  initialValues: CustomerDetailOutput;
};

type FormFields = {
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  invoicePrefix: string;
};
const EditClientDrawer = ({ onClose, isOpen, initialValues }: Props) => {
  const utils = trpc.useContext();
  const mutation = trpc.customer.edit.useMutation();
  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<FormFields>({
    defaultValues: {
      address: initialValues.address ?? '',
      email: initialValues.email,
      invoicePrefix: initialValues.invoicePrefix,
      name: initialValues.name,
      phoneNumber: initialValues.phoneNumber,
    },
  });

  const onSubmit: SubmitHandler<FormFields> = formValues => {
    if (mutation.isLoading) return;
    if (!isDirty) {
      onClose();
      return;
    }
    mutation.mutate(
      {
        ...formValues,
        invoicePrefix: initialValues.invoicePrefix,
        id: initialValues.id,
      },
      {
        onSuccess: data => {
          reset({
            ...data,
            address: data.address ?? '',
          });
          utils.customer.getSingle.invalidate({ customerId: data.id });
          utils.customer.getAll.invalidate();
          onClose();
        },
      }
    );
  };
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Edit Client Information">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-20">
          <TextInput label="Name" name="name" register={register} />
          <div className="basis-1/3">
            <TextInput
              label="Invoice Prefix"
              name="invoicePrefix"
              register={register}
              disabled={true}
            />
          </div>
        </div>
        <TextInput label="Email" name="email" register={register} />
        <TextInput
          label="Phone"
          name="phoneNumber"
          type="tel"
          register={register}
        />
        <TextInput
          label="Address"
          name="address"
          required={false}
          register={register}
        />
        <Button
          type="submit"
          isLoading={mutation.isLoading}
          loadingContent="Saving changes...">
          Save Changes
        </Button>
      </form>
    </Drawer>
  );
};

export default EditClientDrawer;
