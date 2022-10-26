import { Dialog, Transition } from '@headlessui/react';
import { Fragment, PropsWithChildren, ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const Modal = ({
  onClose,
  isOpen,
  children,
}: PropsWithChildren<ModalProps>) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95">
          <Dialog.Panel className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative bg-white p-6 rounded-md flex flex-col space-y-8 max-w-md">
              {children}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export const ModalTitle = ({ children }: { children: ReactNode }) => {
  return (
    <Dialog.Title className="font-semibold text-lg pb-1">
      {children}
    </Dialog.Title>
  );
};

export const ModalDescription = ({ children }: { children: ReactNode }) => {
  return <p className="text-gray-500 text-sm">{children}</p>;
};

export const ModalAction = ({ children }: { children: ReactNode }) => {
  return <div className="space-x-4 ml-auto flex items-center">{children}</div>;
};
