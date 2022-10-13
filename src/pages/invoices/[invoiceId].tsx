import Button from '@components/Button';
import Layout from '@components/Layout';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/solid';
import { trpc } from '@utils/trpc';
import { useRouter } from 'next/router';

const InvoiceDetail = () => {
  const router = useRouter();
  const { invoiceId } = router.query;
  if (!invoiceId || typeof invoiceId !== 'string')
    throw Error(
      `It should be impossible that this invoice Id exist: ${invoiceId}`
    );
  const { data: invoiceDetail } = trpc.invoice.getSingle.useQuery({
    invoiceId,
  });

  return (
    <Layout>
      <div className="flex justify-between items-center px-8 pt-6">
        <button
          className="text-sm flex font-semibold items-center gap-2"
          onClick={() => router.replace('/invoices')}>
          <ArrowLeftIcon className="h-3" /> Back to invoices
        </button>
        <div className="space-x-4">
          <Button variant="outline">Edit</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </div>
      <section className="px-8 flex gap-4 py-6 ">
        {/* LEFT SECTION */}
        <div className="basis-2/3 p-4 ">
          <div className="bg-[#f4f9fa] p-4 rounded-md">
            <div className="w-full space-y-6  rounded-md p-4 bg-white">
              <h2 className="text-lg font-bold">
                Invoice Details - {invoiceId}
              </h2>
              <div className="w-full">
                <h3 className="font-semibold">Invoice Number</h3>
                <p className="text-sm">[Issue date] - [Due Date]</p>
              </div>
              <div className="w-full flex items-start justify-between">
                <div className="basis-1/2">
                  <span className="font-semibold text-sm">from</span>
                  <p>Business Name</p>
                  <p>Business Email</p>
                  <address>Business Address</address>
                </div>
                <div className="basis-1/2">
                  <span className="font-semibold text-sm">to</span>
                  <p>{invoiceDetail?.customer.name}</p>
                  <p>{invoiceDetail?.customer.email}</p>
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
              <div className="">
                <h4 className="text-sm font-semibold">Additional notes</h4>
                <p className="text-sm">{invoiceDetail?.notes}</p>
              </div>
            </div>
          </div>
        </div>
        {/* LEFT SECTION END */}
        {/* RIGHT SECTION */}
        <div className="py-6 basis-1/3 space-y-6">
          <div className=" rounded-md ring-1 ring-gray-200 p-4 flex justify-between">
            <span className="text-xl font-bold">
              $
              {invoiceDetail?.orders.reduce(
                (acc, curr) => acc + curr.amount * curr.quantity,
                0
              )}
            </span>
            <span>{invoiceDetail?.status.toLowerCase()}</span>
          </div>
          <div className="p-4 rounded-md ring-1 ring-gray-200">
            <h3 className="font-semibold">Clients detail</h3>
            <p className="text-sm">{invoiceDetail?.customer.name}</p>
            <p className="text-sm">{invoiceDetail?.customer.email}</p>
            <address className="text-sm">
              {invoiceDetail?.customer.address}
            </address>
          </div>
          <div className="p-4 rounded-md ring-1 ring-gray-200">
            <h3 className="font-semibold">Projects detail</h3>
            <p className="text-sm">Admin 1</p>
            <p className="text-sm">{invoiceDetail?.name}</p>
            <p className="text-sm">{invoiceDetail?.dueDate.toDateString()}</p>
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