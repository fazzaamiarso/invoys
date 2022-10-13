import { PlusIcon } from '@heroicons/react/24/solid';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { ReactNode } from 'react';
import Button from './Button';
import NewInvoiceDrawer, { invoiceDrawerStateAtom } from './NewInvoiceDrawer';

const navigations = [
  { name: 'Dashboard', href: '/' },
  { name: 'Clients', href: '/clients' },
  { name: 'Invoices', href: '/invoices' },
  { name: 'Settings', href: '/#settings' },
];

const NavigationPane = () => {
  return (
    <div className="p-4 space-y-12 h-screen border-r-gray-300 border-[1px] grow">
      <h1 className="text-xl font-bold">LOGO</h1>
      <nav className="">
        <ul className="space-y-8">
          {navigations.map(nav => {
            return (
              <li key={nav.name} className="">
                <Link href={nav.href} className="hover:text-blue-500">
                  {nav.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

const Layout = ({ children }: { children: ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setDrawerOpen] = useAtom(invoiceDrawerStateAtom);

  return (
    <main className="w-screen min-h-screen flex">
      <NavigationPane />
      <section className="basis-[85%]">
        <header className="flex w-full px-12 py-4 border-b-[1px] border-b-gray-300">
          <Button Icon={PlusIcon} onClick={() => setDrawerOpen(true)}>
            New Invoice
          </Button>
          <div className="ml-auto flex items-center gap-4">
            <div className="font-semibold">Gojo Satoru</div>
            <div className="aspect-square w-10 rounded-full bg-pink-500" />
          </div>
        </header>
        {children}
      </section>
      <NewInvoiceDrawer />
    </main>
  );
};
export default Layout;
