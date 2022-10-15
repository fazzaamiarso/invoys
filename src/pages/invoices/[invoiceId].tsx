import Button from '@components/Button';
import StatusBadge from '@components/Invoices/StatusBadge';
import Layout from '@components/Layout';
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  FolderIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/solid';
import { trpc } from '@utils/trpc';
import { BUSINESS_ADDRESS, BUSINESS_NAME } from 'data/businessInfo';
import Link from 'next/link';
import { useRouter } from 'next/router';

const InvoiceDetail = () => {
  const router = useRouter();
  const { invoiceId } = router.query;
  if (!invoiceId || typeof invoiceId !== 'string')
    throw Error(
      `It should be impossible that this invoice Id exist: ${invoiceId}`
    );
  const { data: invoiceDetail } = trpc.invoice.getSingle.useQuery(
    {
      invoiceId,
    },
    { refetchOnWindowFocus: false, keepPreviousData: true }
  );

  return (
    <Layout>
      <div className="flex justify-between items-center ">
        <div>
          <button
            className="text-sm flex font-semibold items-center gap-2"
            onClick={() => router.replace('/invoices')}>
            <ArrowLeftIcon className="h-3" /> Back to invoices
          </button>
          <h2 className="text-xl font-bold">
            Invoice {invoiceDetail?.invoiceNumber}
          </h2>
        </div>
        <div className="space-x-4">
          <Button variant="outline">Edit</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </div>
      <section className="flex gap-4 py-12 ">
        {/* LEFT SECTION */}
        <div className="basis-2/3 pr-8 ">
          <div className="bg-[#f4f9fa] p-4 rounded-md">
            <div className="w-full space-y-6  rounded-md p-4 bg-white">
              <div className="w-full">
                <h3 className="font-semibold">
                  #{invoiceDetail?.invoiceNumber}
                </h3>
                <p className="text-sm">
                  [Issue date] - {invoiceDetail?.dueDate.toDateString()}
                </p>
              </div>
              <div className="w-full flex items-start justify-between gap-12">
                <div className="basis-1/2 text-sm">
                  <span className="font-semibold">from</span>
                  <p>{BUSINESS_NAME}</p>
                  <address>{BUSINESS_ADDRESS}</address>
                </div>
                <div className="basis-1/2 text-sm">
                  <span className="font-semibold">to</span>
                  <p>{invoiceDetail?.customer.name}</p>
                  <address>{invoiceDetail?.customer.address}</address>
                </div>
              </div>
              <div className="bg-gray-200 w-full h-px my-2" />
              <div className="w-full ">
                <div className="w-full py-2 px-3 bg-[#787dee] rounded-t-md">
                  <h3 className="text-white font-bold">Cost Breakdown</h3>
                </div>
                <div className="ring-1 ring-inset ring-gray-300 rounded-b-md">
                  <ul className="flex flex-col px-3">
                    {invoiceDetail?.orders.map(order => {
                      return (
                        <>
                          <li
                            key={order.id}
                            className="flex gap-4 py-4 border-b-[1px] border-gray-200">
                            <h4 className="font-semibold">{order.name}</h4>
                            <div className="">x {order.quantity}</div>
                            <div className="ml-auto">
                              ${order.quantity * order.amount}
                            </div>
                          </li>
                        </>
                      );
                    })}
                  </ul>
                  <div className="w-full flex justify-between px-3 py-5">
                    <div className="text-lg">Amount Due</div>
                    <div className="font-bold text-xl">
                      $
                      {invoiceDetail?.orders.reduce(
                        (acc, curr) => acc + curr.amount * curr.quantity,
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {invoiceDetail?.notes && (
                <div className="">
                  <h4 className="text-sm font-semibold">Additional notes</h4>
                  <p className="text-sm">{invoiceDetail.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* LEFT SECTION END */}
        {/* RIGHT SECTION */}
        <div className="basis-1/3 space-y-6">
          <div className=" rounded-md ring-1 ring-gray-200 p-4 flex justify-between">
            <span className="text-xl font-bold">
              $
              {invoiceDetail?.orders.reduce(
                (acc, curr) => acc + curr.amount * curr.quantity,
                0
              )}
            </span>
            {invoiceDetail?.status && (
              <StatusBadge status={invoiceDetail?.status} />
            )}
          </div>
          <div className="p-4 rounded-md ring-1 ring-gray-200">
            <h3 className="font-semibold pb-4">Projects detail</h3>
            <div className="relative flex items-center gap-2 pb-3 text-gray-600">
              <UserIcon className="h-5" />
              <p className="text-sm">{invoiceDetail?.customer.name}</p>
              <Link
                href={`/clients/${invoiceDetail?.customerId}`}
                className="absolute z-20 text-xs right-0 bg-white text-blue-500 underline hover:no-underline">
                View Detail
              </Link>
            </div>
            <div className="flex items-center gap-2 pb-3 text-gray-600">
              <EnvelopeIcon className="h-5" />
              <p className="text-sm ">{invoiceDetail?.customer.email}</p>
            </div>
            <div className="flex items-center gap-2 pb-3 text-gray-600">
              <FolderIcon className="h-5" />
              <p className="text-sm">{invoiceDetail?.name}</p>
            </div>
            <div className="flex items-center gap-2 pb-3 text-gray-600">
              <CalendarDaysIcon className="h-5" />
              <p className="text-sm">{invoiceDetail?.dueDate.toDateString()}</p>
            </div>

            <div className="bg-gray-200 w-full h-px my-2" />
            <div>
              <h3>Project log</h3>
              <ul>
                <li className="text-sm">Invoice issued</li>
                <li className="text-sm">Due date prolonged</li>
              </ul>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-x-4 flex">
              <Button Icon={EyeIcon} variant="outline">
                Preview
              </Button>
              <Button Icon={ArrowDownTrayIcon} variant="outline">
                Download PDF
              </Button>
            </div>
            <Button variant="primary">Send Invoice to Email</Button>
          </div>
        </div>
        {/* RIGHT SECTION */}
      </section>
    </Layout>
  );
};

export default InvoiceDetail;
