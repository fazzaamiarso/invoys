import { useForm } from 'react-hook-form';
import Drawer from './Drawer';

type Props = {
  onClose: () => void;
  isOpen: boolean;
};
const NewClientDrawer = ({ onClose, isOpen }: Props) => {
  const { register } = useForm();
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Create Client">
      <form onSubmit={() => null}>
        <div>
          <label htmlFor="name">Name</label>
          <input {...register('name')} type="text" id="name" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input {...register('email')} type="text" id="email" />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input {...register('phoneNumber')} type="tel" id="phoneNumber" />
        </div>
        <button className="p-3 rounded-md bg-pink-500">+ Create Client</button>
      </form>
    </Drawer>
  );
};

export default NewClientDrawer;
