import Button from '@components/Button';
import EditClientDrawer from '@components/EditClientDrawer';
import Layout from '@components/Layout';
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
import invariant from 'tiny-invariant';
import {
  Modal,
  ModalAction,
  ModalDescription,
  ModalTitle,
} from '@components/Modal';

const ClientDetails: NextPage = () => {
  const router = useRouter();
  const { clientId } = router.query;

  invariant(
    router.isReady || typeof clientId !== 'string',
    `Client with Id: ${clientId} doesn't exist`
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showEditDrawer = () => setIsEditing(true);
  const hideEditDrawer = () => setIsEditing(false);
  const showDeleteModal = () => setIsDeleting(true);
  const hideDeleteModal = () => setIsDeleting(false);

  const utils = trpc.useContext();
  const { data: clientDetail } = trpc.customer.getSingle.useQuery(
    { customerId: clientId as string },
    {
      keepPreviousData: true,
      enabled: router.isReady,
      initialData: () => {
        const clients = utils.customer.infiniteClients.getInfiniteData({
          query: '',
        });
        return clients?.pages
          .flatMap(p => p.customer)
          .find(client => client.id === clientId);
      },
    }
  );
  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess() {
      utils.customer.getAll.invalidate();
      router.replace('/clients');
    },
  });

  const confirmDelete = () => {
    if (deleteMutation.isLoading || !clientDetail) return;
    deleteMutation.mutate({ clientId: clientDetail.id });
  };

  return (
    <Layout title={clientDetail?.name}>
      {clientDetail && (
        <>
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
                  <h2 className="text-xl font-bold">{clientDetail.name}</h2>
                  <p className="text-sm">
                    Created on {dayjs(clientDetail.createdAt).format('LL')}
                  </p>
                </div>
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
            <section className="flex gap-12 py-12 ">
              {/* LEFT SECTION */}
              <div className="basis-2/3 text-lg">
                <div className="rounded-md  ring-1 ring-gray-200">
                  <h3 className="font-semibold p-4">Client Information</h3>
                  <div className="h-px w-full bg-gray-300" />
                  <div className="w-full grid grid-cols-2 gap-8 p-4">
                    <div className="text-sm">
                      <h4 className="font-semibold">Email</h4>
                      <p>{clientDetail.email}</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold">Phone Number</h4>
                      <p>{clientDetail.phoneNumber}</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold">Prefix</h4>
                      <p>{clientDetail.invoicePrefix}</p>
                    </div>
                    <div className="text-sm">
                      <h4 className="font-semibold">Address</h4>
                      <p>{clientDetail.address}</p>
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
                    {clientDetail.invoices.map(invoice => {
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
              onClose={hideEditDrawer}
              isOpen={isEditing}
              initialValues={clientDetail}
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
                <ModalTitle>{`Delete ${clientDetail.name}?`}</ModalTitle>
                <ModalDescription>
                  Are you sure you want to delete this client? Data will be
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

export default ClientDetails;
