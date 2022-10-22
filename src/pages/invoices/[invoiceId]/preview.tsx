import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '@utils/trpc';
import { dayjs } from '@lib/dayjs';
import { BUSINESS_NAME, BUSINESS_ADDRESS } from 'data/businessInfo';
import { useRef } from 'react';
import Button from '@components/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import invariant from 'tiny-invariant';
import { calculateOrderAmount, downloadPdf } from '@utils/invoice';

const InvoicePreview: NextPage = () => {
  const router = useRouter();
  const { invoiceId } = router.query;

  invariant(
    router.isReady || typeof invoiceId !== 'string',
    `It should be impossible that this invoice Id exist: ${invoiceId}`
  );

  const pdfRef = useRef<HTMLDivElement>(null);

  const { data: invoiceDetail } = trpc.invoice.getSingle.useQuery(
    {
      invoiceId: invoiceId as string,
    },
    {
      staleTime: Infinity,
      keepPreviousData: true,
      enabled: router.isReady,
    }
  );

  const handleDownloadPdf = async () =>
    await downloadPdf(pdfRef, `Invoice #${invoiceDetail?.invoiceNumber}.pdf`);

  return (
    <>
      <main className="w-10/12 mx-auto max-w-xl space-y-6 py-12">
        <h2 className="text-lg font-bold">Preview</h2>
        {invoiceDetail && (
          <>
            <div
              ref={pdfRef}
              className="w-full space-y-6  rounded-md p-4 ring-1 ring-gray-300 bg-white">
              <div className="w-full">
                <h3 className="font-semibold">
                  Invoice #{invoiceDetail.invoiceNumber}
                </h3>
                <p className="text-sm">
                  Issued on{dayjs(invoiceDetail.issuedOn).format('LL')} - Due on{' '}
                  {dayjs(invoiceDetail.dueDate).format('LL')}
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
                  <p>{invoiceDetail.customer.name}</p>
                  <address>{invoiceDetail.customer.address}</address>
                </div>
              </div>
              <div className="bg-gray-200 w-full h-px my-2" />
              <div className="w-full ">
                <div className="w-full py-2 px-3 bg-[#787dee] rounded-t-md">
                  <h3 className="text-white font-bold">Cost Breakdown</h3>
                </div>
                <div className="ring-1 ring-inset ring-gray-300 rounded-b-md">
                  <ul className="flex flex-col px-3">
                    {invoiceDetail.orders.map(order => {
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
                      ${calculateOrderAmount(invoiceDetail.orders)}
                    </div>
                  </div>
                </div>
              </div>
              {invoiceDetail.notes && (
                <div className="">
                  <h4 className="text-sm font-semibold">Additional notes</h4>
                  <p className="text-sm">{invoiceDetail.notes}</p>
                </div>
              )}
            </div>
          </>
        )}
        <div>
          <Button
            Icon={ArrowDownTrayIcon}
            variant="outline"
            onClick={handleDownloadPdf}>
            Download PDF
          </Button>
        </div>
      </main>
    </>
  );
};

export default InvoicePreview;
