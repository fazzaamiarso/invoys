import { generatePrefix } from '@utils/invoice';
import { trpc } from '@utils/trpc';
import { SubmitHandler, useForm } from 'react-hook-form';
import Button from './Button';
import Drawer from './Drawer';
import TextInput from './Form/TextInput';

type Props = {
  onClose: () => void;
  isOpen: boolean;
};

type FormFields = {
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  invoicePrefix: string;
};
const NewClientDrawer = ({ onClose, isOpen }: Props) => {
  const utils = trpc.useContext();
  const mutation = trpc.customer.create.useMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    shouldUseNativeValidation: false,
    defaultValues: { invoicePrefix: generatePrefix() },
  });

  const onSubmit: SubmitHandler<FormFields> = formValues => {
    mutation.mutate(formValues, {
      onSuccess: () => {
        utils.customer.infiniteClients.invalidate();
        onClose();
        reset();
      },
    });
  };
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Create Client">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-20">
          <TextInput
            label="Name"
            name="name"
            register={register}
            errors={errors}
          />
          <div className="basis-1/3">
            <TextInput
              label="Invoice Prefix"
              name="invoicePrefix"
              register={register}
              errors={errors}
            />
          </div>
        </div>
        <TextInput
          label="Email"
          name="email"
          register={register}
          errors={errors}
        />
        <TextInput
          label="Phone"
          name="phoneNumber"
          type="tel"
          register={register}
          errors={errors}
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
          loadingContent="Adding client...">
          New Client
        </Button>
      </form>
    </Drawer>
  );
};

export default NewClientDrawer;
