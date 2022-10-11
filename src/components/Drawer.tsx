import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { PropsWithChildren } from 'react';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};
const Drawer = ({
  isOpen,
  onClose,
  children,
  title,
}: PropsWithChildren<DrawerProps>) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <Dialog.Panel className="fixed shadow-sm right-0 inset-y-0 bg-white overflow-y-auto">
        <div className="relative p-6 w-[500px]">
          <div>
            <button className="h-6 aspect-square" onClick={onClose}>
              <XMarkIcon />
            </button>
          </div>
          <Dialog.Title className="font-bold text-xl">{title}</Dialog.Title>
          {children}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default Drawer;
