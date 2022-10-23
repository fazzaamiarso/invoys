import Button from '@components/Button';
import StatusBadge from '@components/Invoices/StatusBadge';
import Layout from '@components/Layout';
import { Listbox, Transition } from '@headlessui/react';
import {
  CalendarDaysIcon,
  CheckIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FolderIcon,
  PaperAirplaneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import { trpc } from '@utils/trpc';
import { BUSINESS_ADDRESS, BUSINESS_NAME } from 'data/businessInfo';
import { dayjs } from '@lib/dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useRef, useState } from 'react';
import { InvoiceStatus } from '@prisma/client';
import { EditInvoiceDrawer } from '@components/InvoiceDrawer/EditInvoiceDrawer';
import { capitalize } from '@utils/display';
import { calculateOrderAmount, downloadPdf } from '@utils/invoice';
import invariant from 'tiny-invariant';
import {
  Modal,
  ModalTitle,
  ModalDescription,
  ModalAction,
} from '@components/Modal';
import clsx from 'clsx';
import Spinner from '@components/Spinner';

const InvoiceDetail = () => {
  const router = useRouter();
  const { invoiceId } = router.query;

  invariant(
    router.isReady || typeof invoiceId !== 'string',
    `It should be impossible that this invoice ID exist: ${invoiceId}`
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showEditDrawer = () => setIsEditing(true);
  const hideEditDrawer = () => setIsEditing(false);
  const showDeleteModal = () => setIsDeleting(true);
  const hideDeleteModal = () => setIsDeleting(false);

  const pdfRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useContext();
  const { data: invoiceDetail, status } = trpc.invoice.getSingle.useQuery(
    {
      invoiceId: invoiceId as string,
    },
    {
      keepPreviousData: true,
      enabled: router.isReady,
      initialData: () => {
        const invoices = utils.invoice.infiniteInvoices.getInfiniteData({
          query: '',
        });
        return invoices?.pages
          .flatMap(p => p.invoices)
          .find(invoice => invoice.id === invoiceId);
      },
    }
  );

  const deleteMutation = trpc.invoice.delete.useMutation({
    onSuccess() {
      utils.invoice.infiniteInvoices.invalidate();
      router.replace('/invoices');
    },
  });
  const sendEmailMutation = trpc.invoice.sendEmail.useMutation({});

  const confirmDelete = () => {
    if (deleteMutation.isLoading || !invoiceDetail) return;
    deleteMutation.mutate({ invoiceId: invoiceDetail.id });
  };

  const sendInvoiceEmail = () => {
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : process.env.VERCEL_URL;
    if (!invoiceDetail || sendEmailMutation.isLoading) return;
    sendEmailMutation.mutate({
      customerName: invoiceDetail.customer.name,
      invoiceNumber: `#${invoiceDetail.invoiceNumber}`,
      invoiceViewUrl: `${baseUrl}/invoices/${invoiceDetail.id}/preview`,
    });
  };

  //TODO: handle case when the screen size is not full
  const handleDownloadPdf = async () => {
    if (!invoiceDetail) return;
    await downloadPdf(pdfRef, `Invoice #${invoiceDetail.invoiceNumber}.pdf`);
  };

  return (
    <Layout title={invoiceDetail?.invoiceNumber}>
      {status === 'loading' && (
        <div className="w-full flex items-center justify-center pt-40">
          <Spinner />
        </div>
      )}
      {invoiceDetail && (
        <>
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
              <Button variant="outline" onClick={showEditDrawer}>
                Edit
              </Button>
              <Button variant="danger" onClick={showDeleteModal}>
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
                      Issued on {dayjs(invoiceDetail.issuedOn).format('LL')} -
                      Due on {dayjs(invoiceDetail.dueDate).format('LL')}
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
                      <h4 className="text-sm font-semibold">
                        Additional notes
                      </h4>
                      <p className="text-sm">{invoiceDetail.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* LEFT SECTION END */}
            {/* RIGHT SECTION */}
            <div className="basis-1/3 space-y-6">
              <div className=" rounded-md ring-1 ring-gray-200 p-4 flex items-center justify-between">
                <span className="text-xl font-bold">
                  ${calculateOrderAmount(invoiceDetail?.orders)}
                </span>
                <StatusSelect
                  status={invoiceDetail.status}
                  invoiceId={invoiceDetail.id}
                />
              </div>
              <div className="p-4 rounded-md ring-1 ring-gray-200">
                <h3 className="font-semibold pb-4">Projects detail</h3>
                <div className="relative flex items-center gap-2 pb-3 text-gray-600">
                  <UserIcon className="h-5" />
                  <p className="text-sm">{invoiceDetail.customer.name}</p>
                  <Link
                    href={`/clients/${invoiceDetail.customerId}`}
                    className="absolute z-20 text-xs right-0 bg-white text-blue-500 underline hover:no-underline">
                    View Detail
                  </Link>
                </div>
                <div className="flex items-center gap-2 pb-3 text-gray-600">
                  <EnvelopeIcon className="h-5" />
                  <p className="text-sm ">{invoiceDetail.customer.email}</p>
                </div>
                <div className="flex items-center gap-2 pb-3 text-gray-600">
                  <FolderIcon className="h-5" />
                  <p className="text-sm">{invoiceDetail.name}</p>
                </div>
                <div className="flex items-center gap-2 pb-3 text-gray-600">
                  <CalendarDaysIcon className="h-5" />
                  <p className="text-sm">
                    {dayjs(invoiceDetail.dueDate).format('DD MMM YYYY')}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-x-4 flex">
                  <Button
                    variant="outline"
                    Icon={EyeIcon}
                    href={`/invoices/${invoiceId}/preview`}
                    target="_blank"
                    rel="noReferrer">
                    Preview
                  </Button>
                  <Button
                    Icon={ArrowDownTrayIcon}
                    variant="outline"
                    onClick={handleDownloadPdf}>
                    Download PDF
                  </Button>
                </div>
                <Button
                  variant="primary"
                  Icon={PaperAirplaneIcon}
                  onClick={sendInvoiceEmail}>
                  Send Invoice to Email
                </Button>
              </div>
            </div>
            {/* RIGHT SECTION */}
          </section>
          {invoiceDetail && (
            <EditInvoiceDrawer
              invoiceDetails={invoiceDetail}
              onClose={hideEditDrawer}
              isOpen={isEditing}
            />
          )}
          <Modal isOpen={isDeleting} onClose={hideDeleteModal}>
            <div className="flex gap-6">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <ModalTitle>{`Delete Invoice ${invoiceDetail.invoiceNumber}?`}</ModalTitle>
                <ModalDescription>
                  Are you sure you want to delete this Invoice? Data will be
                  permanently removed. This action cannot be undone.
                </ModalDescription>
              </div>
            </div>
            <ModalAction>
              <Button variant="outline" onClick={hideDeleteModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Confirm
              </Button>
            </ModalAction>
          </Modal>
        </>
      )}
    </Layout>
  );
};

export default InvoiceDetail;

const StatusSelect = ({
  status,
  invoiceId,
}: {
  status: InvoiceStatus;
  invoiceId: string;
}) => {
  const utils = trpc.useContext();
  const mutation = trpc.invoice.updateStatus.useMutation({
    onSuccess() {
      utils.invoice.infiniteInvoices.invalidate(undefined);
      utils.invoice.getSingle.invalidate({ invoiceId });
    },
  });

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    if (newStatus === status || mutation.isLoading) return;
    mutation.mutate({ status: newStatus, invoiceId });
  };

  return (
    <Listbox onChange={handleStatusChange} value={status}>
      <div className="relative ">
        <Listbox.Button className="ring-1 items-center gap-2 flex ring-gray-200 rounded-md p-1 pr-2">
          <StatusBadge status={status} />
          <ChevronDownIcon className="h-3" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <Listbox.Options className="absolute z-50 bg-white w-full p-1 right-0 translate-y-1">
            {Object.values(InvoiceStatus).map(stat => {
              return (
                <Listbox.Option as={Fragment} key={stat} value={stat}>
                  {({ active, selected }) => {
                    return (
                      <li
                        className={clsx(
                          active && 'bg-[#f5f7f9]',
                          'p-2 rounded-md text-sm cursor-pointer flex items-center'
                        )}>
                        <span>{capitalize(stat)}</span>
                        {selected && (
                          <CheckIcon className="h-4 text-gray-700 aspect-square ml-auto" />
                        )}
                      </li>
                    );
                  }}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
