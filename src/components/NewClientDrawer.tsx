import { PlusIcon } from '@heroicons/react/24/solid';
import { Path, SubmitHandler, useForm, UseFormRegister } from 'react-hook-form';
import Button from './Button';
import Drawer from './Drawer';

type Props = {
  onClose: () => void;
  isOpen: boolean;
};

type FormFields = {
  name: string;
  email: string;
  phoneNumber: string;
};
const NewClientDrawer = ({ onClose, isOpen }: Props) => {
  const { register, handleSubmit } = useForm<FormFields>();

  const onSubmit: SubmitHandler<FormFields> = () => {
    return null;
  };
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Create Client">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input label="Name" name="name" register={register} />
        <Input label="Email" name="email" register={register} />
        <Input label="Phone" name="phoneNumber" register={register} />
        <Button Icon={PlusIcon}>New Client</Button>
      </form>
    </Drawer>
  );
};

export default NewClientDrawer;

type InputProps = {
  label: string;
  name: Path<FormFields>;
  register: UseFormRegister<FormFields>;
};

const Input = ({ label, register, name }: InputProps) => (
  <div className="flex flex-col gap-2 mb-2">
    <label htmlFor={name}>{label}</label>
    <input
      type="text"
      autoComplete="off"
      {...register(name, { required: true })}
      id={name}
      name={name}
      className="rounded-md"
    />
  </div>
);
