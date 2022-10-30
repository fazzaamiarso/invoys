import { dayjs } from '@lib/dayjs';
import { calculateOrderAmount } from '@utils/invoice';
import { InferProcedures } from '@utils/trpc';
import { forwardRef } from 'react';

type InvoiceDetailOutput = InferProcedures['invoice']['getSingle']['output'];
type SettingsOutput = InferProcedures['setting']['get']['output'];

type Props = {
  invoiceDetail: NonNullable<InvoiceDetailOutput>;
  settings: SettingsOutput;
};
const InvoicePdf = forwardRef<HTMLDivElement, Props>(
  ({ invoiceDetail, settings }, ref) => {
    return (
      <div ref={ref} className="w-full space-y-6  rounded-md p-4 bg-white">
        <div className="w-full">
          <h3 className="font-semibold">
            Invoice #{invoiceDetail?.invoiceNumber}
          </h3>
          <p className="text-sm">
            Issued on {dayjs(invoiceDetail.issuedOn).format('LL')} - Due on{' '}
            {dayjs(invoiceDetail.dueDate).format('LL')}
          </p>
        </div>
        <div className="w-full flex items-start justify-between gap-12">
          <div className="basis-1/2 text-sm">
            <span className="font-semibold">from</span>
            <p>{settings.businessName}</p>
            <address>{settings.businessAddress}</address>
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
                      <h4 className="font-semibold" data-cy="order-name">
                        {order.name}
                      </h4>
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
              <div className="font-semibold text-lg">
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
    );
  }
);

InvoicePdf.displayName = 'Invoice PDF';
export default InvoicePdf;
