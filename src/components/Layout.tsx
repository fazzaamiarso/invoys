import {
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  PlusIcon,
  Squares2X2Icon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { twGradients } from 'data/gradients';
import { useSetAtom } from 'jotai';
import { signOut, useSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import Button from './Button';
import {
  invoiceDrawerStateAtom,
  NewInvoiceDrawer,
} from './InvoiceDrawer/NewInvoiceDrawer';
import logo from '@assets/invoys.webp';

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
    href: '/settings',
    Icon: Cog6ToothIcon,
  },
];

const NavigationPane = () => {
  const router = useRouter();
  return (
    <div className="py-4 space-y-6 h-screen border-r-gray-300 border-r-[1px] grow sticky top-px z-20">
      <div className="w-20">
        <Image src={logo} alt="logo" />
      </div>
      <h1 className="text-xl font-bold flex flex-col justify-between sr-only">
        Invoys
      </h1>
      <nav className="">
        <ul className="">
          {navigations.map(nav => {
            const currPath = router.pathname;
            const href = nav.href;
            const isActive =
              (currPath === '/' && href === '/') ||
              (currPath !== '/' && href !== '/' && currPath.startsWith(href));

            return (
              <li
                key={nav.name}
                className={clsx(
                  isActive && 'bg-[#eff3ff]  border-l-primary ',
                  'w-full border-l-4'
                )}>
                <Link
                  href={nav.href}
                  className={clsx('flex gap-4 items-center p-4')}>
                  <nav.Icon
                    className={clsx(
                      isActive ? 'text-primary' : 'text-gray-600',
                      'h-5 aspect-square '
                    )}
                  />
                  <span
                    className={clsx(
                      isActive ? 'text-primary' : 'text-gray-600',
                      'text-sm'
                    )}>
                    {nav.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <ul className="">
        <li key="logout" className="w-full ">
          <button
            onClick={() => signOut()}
            className="hover:text-blue-500 flex gap-4 items-center p-4 border-l-4">
            <ArrowLeftOnRectangleIcon
              className={clsx('h-5 aspect-square text-gray-600')}
            />
            <span className={clsx('text-sm  text-gray-600')}>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

const Layout = ({
  children,
  title,
  breakLayout = false,
}: {
  children: ReactNode;
  title?: string;
  breakLayout?: boolean;
}) => {
  const setDrawerOpen = useSetAtom(invoiceDrawerStateAtom);
  const session = useSession();
  const gradient = session.data?.user.gradient
    ? twGradients[session.data.user.gradient]
    : '';

  return (
    <>
      <NextSeo title={title} />
      <main className="w-screen min-h-screen flex">
        <NavigationPane />
        <section className="basis-[85%]">
          <header className="flex w-full px-12 py-4 border-b-[1px] border-b-gray-300 sticky top-px bg-white z-20">
            <Button Icon={PlusIcon} onClick={() => setDrawerOpen(true)}>
              New Invoice
            </Button>
            <div className="ml-auto flex items-center gap-4">
              <div className="font-semibold text-sm">
                {session.data?.user?.email ?? 'Gojo Satoru@jujutsu.com'}
              </div>
              <div
                className={clsx(gradient, 'aspect-square w-10 rounded-full')}
              />
            </div>
          </header>
          <div className={clsx(breakLayout ? '' : 'content-layout py-8')}>
            {children}
          </div>
        </section>
        <NewInvoiceDrawer />
      </main>
    </>
  );
};
export default Layout;
