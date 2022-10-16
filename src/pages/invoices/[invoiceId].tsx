import Button from '@components/Button';
import StatusBadge from '@components/Invoices/StatusBadge';
import Layout from '@components/Layout';
import { Dialog } from '@headlessui/react';
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
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
import { dayjs } from '@lib/dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

const InvoiceDetail = () => {
  const router = useRouter();
  const { invoiceId } = router.query;
  if (!invoiceId || typeof invoiceId !== 'string')
    throw Error(
      `It should be impossible that this invoice Id exist: ${invoiceId}`
    );

  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useContext();
  const { data: invoiceDetail } = trpc.invoice.getSingle.useQuery(
    {
      invoiceId,
    },
    { refetchOnWindowFocus: false, keepPreviousData: true }
  );

  const deleteMutation = trpc.invoice.delete.useMutation({
    onSuccess() {
      utils.invoice.getAll.invalidate();
      router.replace('/invoices');
    },
  });

  const handleDownloadPdf = async () => {
    const element = pdfRef.current;
    if (!element) return null;
    // const canvas = await html2canvas(element);
    // const data = canvas.toDataURL('image/png');
    const dataUrl = await toPng(element);
    console.log(dataUrl);

    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice #${invoiceDetail?.invoiceNumber}.pdf`);
  };

  return (
    <Layout title={invoiceDetail?.invoiceNumber}>
      <div className="flex justify-between items-center ">
        <div>
          <button
            className="text-sm flex font-semibold items-center gap-2"
            onClick={() => router.back()}>
            <ArrowLeftIcon className="h-3" /> Back to invoices
          </button>
          <h2 className="text-xl font-bold">
            Invoice {invoiceDetail?.invoiceNumber}
          </h2>
        </div>
        <div className="space-x-4">
          <Button variant="outline">Edit</Button>
          <Button variant="danger" onClick={() => setIsDeleting(true)}>
            Delete
          </Button>
        </div>
      </div>
      <section className="flex gap-4 py-12 ">
        {/* LEFT SECTION */}
        <div className="basis-2/3 pr-8 ">
          <div className="bg-[#f4f9fa] p-4 rounded-md">
            <div
              ref={pdfRef}
              className="w-full space-y-6  rounded-md p-4 bg-white">
              <div className="w-full">
                <h3 className="font-semibold">
                  Invoice #{invoiceDetail?.invoiceNumber}
                </h3>
                <p className="text-sm">
                  Issued on{dayjs(invoiceDetail?.issuedOn).format('LL')} - Due
                  on {dayjs(invoiceDetail?.dueDate).format('LL')}
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
              <p className="text-sm">
                {dayjs(invoiceDetail?.dueDate).format('DD MMM YYYY')}
              </p>
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
              <Button
                Icon={EyeIcon}
                variant="outline"
                onClick={() => setIsPreviewing(!isPreviewing)}>
                Preview
              </Button>
              <Button
                Icon={ArrowDownTrayIcon}
                variant="outline"
                onClick={handleDownloadPdf}>
                Download PDF
              </Button>
            </div>
            <Button variant="primary">Send Invoice to Email</Button>
          </div>
        </div>
        {/* RIGHT SECTION */}
      </section>
      <DeleteModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={() =>
          !deleteMutation.isLoading && deleteMutation.mutate({ invoiceId })
        }
        title={`Delete Invoice ${invoiceDetail?.invoiceNumber}?`}
        description="Are you sure you want to delete this Invoice? Data will be
        permanently removed. This action cannot be undone."
      />
    </Layout>
  );
};

export default InvoiceDetail;

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
};
const DeleteModal = ({
  onClose,
  onConfirm,
  isOpen,
  title,
  description,
}: DeleteModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 transition-opacity" />
      <Dialog.Panel className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative bg-white p-6 rounded-md flex flex-col space-y-8 max-w-md">
          <div className="flex gap-6">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div>
              <Dialog.Title className="font-semibold text-lg pb-1">
                {title}
              </Dialog.Title>
              <p className="text-gray-500 text-sm">{description ?? ''}</p>
            </div>
          </div>
          <div className="space-x-4 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};
