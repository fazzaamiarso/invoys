import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Fragment, PropsWithChildren } from 'react';

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
    <Transition show={isOpen}>
      <Dialog open={isOpen} static onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter=" ease-in-out duration-300 "
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave=" ease-in-out duration-300 "
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full">
          <Dialog.Panel className="fixed shadow-sm right-0 inset-y-0 bg-white overflow-y-auto">
            <div className="relative p-8 w-[550px] space-y-6">
              <div className="flex items-center justify-between">
                <Dialog.Title className="font-bold text-lg">
                  {title}
                </Dialog.Title>
                <button className="h-6 aspect-square" onClick={onClose}>
                  <XMarkIcon />
                </button>
              </div>
              {children}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Drawer;
