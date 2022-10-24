import type { NextPage } from 'next';
import Layout from '@components/Layout';
import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { trpc } from '@utils/trpc';

const Home: NextPage = () => {
  const { data: settings } = trpc.setting.get.useQuery(undefined, {
    keepPreviousData: true,
    staleTime: Infinity,
  });

  return (
    <>
      <Layout title="Dashboard" breakLayout>
        {settings?.businessName === '' && (
          <div className=" bg-indigo-600">
            <div className="mx-auto py-3 mb-6 px-3 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex w-0 flex-1 items-center">
                  <span className="flex rounded-lg bg-indigo-800 p-2">
                    <ExclamationCircleIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                  <p className="ml-3 truncate font-medium text-white">
                    <span className="hidden md:inline">
                      Welcome! Please setup your business info in setting!
                    </span>
                  </p>
                </div>
                <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
                  <Link
                    href="/settings"
                    className="py-2 px-4 rounded-md text-sm font-semibold bg-white">
                    Go to settings
                  </Link>
                </div>
                <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                  <button
                    type="button"
                    className="-mr-1 flex rounded-md p-2 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2">
                    <span className="sr-only">Dismiss</span>
                    <XMarkIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="content-layout py-8">
          <h2 className="text-lg font-bold">Dashboard</h2>
        </div>
      </Layout>
    </>
  );
};

export default Home;
