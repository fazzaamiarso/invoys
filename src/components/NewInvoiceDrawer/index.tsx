import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import InvoiceForm from './InvoiceForm';

type DrawerProps = {
  onClose: () => void;
  isOpen: boolean;
};
const NewInvoiceDrawer = ({ onClose, isOpen }: DrawerProps) => {
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
          <Dialog.Title className="font-bold text-xl">
            Create Invoice
          </Dialog.Title>
          <InvoiceForm />
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default NewInvoiceDrawer;
