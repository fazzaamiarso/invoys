import Drawer from '@components/Drawer';
import { InferProcedures, trpc } from '@utils/trpc';
import { atom, useAtom } from 'jotai';
import EditInvoiceForm from './EditInvoiceForm';
import InvoiceForm from './InvoiceForm';

export const invoiceDrawerStateAtom = atom(false);

export const NewInvoiceDrawer = () => {
  const [isOpen, setIsOpen] = useAtom(invoiceDrawerStateAtom);
  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Create Invoice">
      <InvoiceForm onClose={() => setIsOpen(false)} />
    </Drawer>
  );
};

export type InvoiceGetSingleOutput =
  InferProcedures['invoice']['getSingle']['output'];

export const EditInvoiceDrawer = ({
  invoiceDetails,
  isOpen,
  onClose,
}: {
  invoiceDetails: InvoiceGetSingleOutput;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Edit Invoice">
      <EditInvoiceForm invoiceDetails={invoiceDetails} onClose={onClose} />
    </Drawer>
  );
};
