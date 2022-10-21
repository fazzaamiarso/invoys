import Button from '@components/Button';
import EditClientDrawer from '@components/EditClientDrawer';
import Layout from '@components/Layout';
import { Dialog } from '@headlessui/react';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';
import { trpc } from '@utils/trpc';
import { dayjs } from '@lib/dayjs';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const ClientDetails: NextPage = () => {
  const router = useRouter();
  const { clientId } = router.query;
  if (!clientId || typeof clientId !== 'string')
    throw Error(`Client with Id: ${clientId} doesn't exist`);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const utils = trpc.useContext();
  const { data: clientDetail } = trpc.customer.getSingle.useQuery(
    { customerId: clientId },
    {}
  );
  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess() {
      utils.customer.getAll.invalidate();
      router.replace('/clients');
    },
  });

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
                Created on {dayjs(clientDetail?.createdAt).format('LL')}
              </p>
            </div>
          </div>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setIsDeleting(true)}>
              Delete
            </Button>
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
                    <li
                      key={invoice.id}
                      className="flex w-full justify-between text-sm gap-4">
                      <Link href={`/invoices/${invoice.id}`}>
                        <span className="line-clamp-1">
                          #{invoice.invoiceNumber} - {invoice.name}
                        </span>
                      </Link>
                      <div className="text-gray-500">
                        {dayjs(invoice.createdAt).format('MMM D')}
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
      {clientDetail && (
        <EditClientDrawer
          onClose={() => setIsEditing(false)}
          isOpen={isEditing}
          initialValues={clientDetail}
        />
      )}
      <DeleteModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={() =>
          !deleteMutation.isLoading && deleteMutation.mutate({ clientId })
        }
        title={`Delete ${clientDetail?.name}?`}
        description="Are you sure you want to delete this Invoice? Data will be
        permanently removed. This action cannot be undone."
      />
    </Layout>
  );
};

export default ClientDetails;

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
