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
};
const NewClientDrawer = ({ onClose, isOpen }: Props) => {
  const utils = trpc.useContext();
  const mutation = trpc.customer.create.useMutation();
  const { register, handleSubmit } = useForm<FormFields>();

  const onSubmit: SubmitHandler<FormFields> = formValues => {
    mutation.mutate(formValues, {
      onSuccess: () => {
        utils.customer.getAll.invalidate();
        onClose();
      },
    });
  };
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Create Client">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <TextInput label="Name" name="name" register={register} />
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
        <Button type="submit">New Client</Button>
      </form>
    </Drawer>
  );
};

export default NewClientDrawer;
