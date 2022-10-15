import Button from '@components/Button';
import Layout from '@components/Layout';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { trpc } from '@utils/trpc';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ClientDetails: NextPage = () => {
  const router = useRouter();
  const { clientId } = router.query;
  if (!clientId || typeof clientId !== 'string')
    throw Error(`Client with Id: ${clientId} doesn't exist`);

  const { data: clientDetail } = trpc.customer.getSingle.useQuery(
    { customerId: clientId },
    { refetchOnWindowFocus: false }
  );

  return (
    <Layout title={clientDetail?.name}>
      <div className="w-full ">
        <div className="flex justify-between items-center ">
          <div>
            <button
              className="text-sm flex font-semibold items-center gap-2"
              onClick={() => router.back()}>
              <ArrowLeftIcon className="h-3" />
              Go Back
            </button>
            <div>
              <h2 className="text-xl font-bold">{clientDetail?.name}</h2>
              <p className="text-sm">
                Created on {clientDetail?.createdAt.toDateString()}
              </p>
            </div>
          </div>
          <div className="space-x-4">
            <Button variant="outline">Edit</Button>
            <Button variant="danger">Delete</Button>
          </div>
        </div>
        <section className="flex gap-12 py-12 ">
          {/* LEFT SECTION */}
          <div className="basis-2/3 text-lg">
            <div className="rounded-md  ring-1 ring-gray-200">
              <h3 className="font-semibold p-4">Client Information</h3>
              <div className="h-px w-full bg-gray-300" />
              <div className="w-full grid grid-cols-2 gap-8 p-4">
                <div className="text-sm">
                  <h4 className="font-semibold">Email</h4>
                  <p>{clientDetail?.email}</p>
                </div>
                <div className="text-sm">
                  <h4 className="font-semibold">Phone Number</h4>
                  <p>{clientDetail?.phoneNumber}</p>
                </div>
                <div className="text-sm">
                  <h4 className="font-semibold">Prefix</h4>
                  <p>{clientDetail?.invoicePrefix}</p>
                </div>
                <div className="text-sm">
                  <h4 className="font-semibold">Address</h4>
                  <p>{clientDetail?.address}</p>
                </div>
              </div>
            </div>
          </div>
          {/* LEFT SECTION END */}
          {/* RIGHT SECTION */}
          <div className="basis-1/3">
            <div className="rounded-md p-4 ring-1 ring-gray-200">
              <h3 className="font-semibold pb-4">Transaction History</h3>
              <ul className="space-y-4">
                {clientDetail?.invoices.map(invoice => {
                  return (
                    <li key={invoice.id} className="flex w-full text-sm gap-4">
                      <Link href={`/invoices/${invoice.id}`}>
                        <span className="line-clamp-1">
                          #{invoice.invoiceNumber} - {invoice.name}
                        </span>
                      </Link>
                      <div className="text-gray-500">
                        {invoice.createdAt.toDateString()}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {/* RIGHT SECTION END */}
        </section>
      </div>
    </Layout>
  );
};

export default ClientDetails;
