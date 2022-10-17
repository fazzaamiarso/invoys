import {
  BanknotesIcon,
  Cog6ToothIcon,
  PlusIcon,
  Squares2X2Icon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import Button from './Button';
import { invoiceDrawerStateAtom, NewInvoiceDrawer } from './NewInvoiceDrawer';

const navigations = [
  {
    name: 'Dashboard',
    href: '/',
    Icon: Squares2X2Icon,
  },
  { name: 'Clients', href: '/clients', Icon: UsersIcon },
  {
    name: 'Invoices',
    href: '/invoices',
    Icon: BanknotesIcon,
  },
  {
    name: 'Settings',
    href: '/#settings',
    Icon: Cog6ToothIcon,
  },
];

const NavigationPane = () => {
  const router = useRouter();
  return (
    <div className="p-4 space-y-12 h-screen border-r-gray-300 border-[1px] grow">
      <h1 className="text-xl font-bold">LOGO</h1>
      <nav className="">
        <ul className="space-y-8">
          {navigations.map(nav => {
            const currPath = router.pathname;
            const href = nav.href;
            const isActive =
              (currPath === '/' && href === '/') ||
              (currPath !== '/' && href !== '/' && currPath.startsWith(href));

            return (
              <li key={nav.name} className="w-full">
                <Link
                  href={nav.href}
                  className="hover:text-blue-500 flex gap-4 items-center">
                  <nav.Icon
                    className={clsx(
                      'h-5 aspect-square text-gray-600',
                      isActive && 'text-purple-600'
                    )}
                  />
                  <span
                    className={clsx(
                      'text-sm  text-gray-600',
                      isActive && 'text-black'
                    )}>
                    {nav.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

const Layout = ({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setDrawerOpen] = useAtom(invoiceDrawerStateAtom);

  return (
    <>
      <NextSeo title={title} />
      <main className="w-screen min-h-screen flex">
        <NavigationPane />
        <section className="basis-[85%]">
          <header className="bg-white flex w-full px-12 py-4 border-b-[1px] border-b-gray-300">
            <Button Icon={PlusIcon} onClick={() => setDrawerOpen(true)}>
              New Invoice
            </Button>
            <div className="ml-auto flex items-center gap-4">
              <div className="font-semibold">Gojo Satoru</div>
              <div className="aspect-square w-10 rounded-full bg-pink-500" />
            </div>
          </header>
          <div className="content-layout py-8">{children}</div>
        </section>
        <NewInvoiceDrawer />
      </main>
    </>
  );
};
export default Layout;
