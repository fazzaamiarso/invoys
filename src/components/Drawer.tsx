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
        <div className="relative p-6 w-[500px] space-y-6">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-bold text-lg">{title}</Dialog.Title>
            <button className="h-6 aspect-square" onClick={onClose}>
              <XMarkIcon />
            </button>
          </div>
          {children}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default Drawer;
