import Drawer from '@components/Drawer';
import { atom, useAtom } from 'jotai';
import InvoiceForm from './InvoiceForm';

export const invoiceDrawerStateAtom = atom(false);

const NewInvoiceDrawer = () => {
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

export default NewInvoiceDrawer;
