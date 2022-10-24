import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '@utils/trpc';
import { useRef } from 'react';
import Button from '@components/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import invariant from 'tiny-invariant';
import { downloadPdf } from '@utils/invoice';
import InvoicePdf from '@components/Invoices/InvoicePdf';

const InvoicePreview: NextPage = () => {
  const router = useRouter();
  const { invoiceId } = router.query;

  invariant(
    router.isReady || typeof invoiceId !== 'string',
    `It should be impossible that this invoice Id exist: ${invoiceId}`
  );

  const pdfRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useContext();
  const { data: settings } = trpc.setting.get.useQuery(undefined, {
    keepPreviousData: true,
    staleTime: Infinity,
  });
  const { data: invoiceDetail } = trpc.invoice.getSingle.useQuery(
    {
      invoiceId: invoiceId as string,
    },
    {
      staleTime: Infinity,
      keepPreviousData: true,
      enabled: router.isReady,
      initialData: () => {
        const invoice = utils.invoice.getSingle.getData({
          invoiceId: invoiceId as string,
        });
        return invoice;
      },
    }
  );

  const handleDownloadPdf = async () =>
    await downloadPdf(pdfRef, `Invoice #${invoiceDetail?.invoiceNumber}.pdf`);

  return (
    <>
      <main className="w-10/12 mx-auto max-w-xl space-y-6 py-12">
        <h2 className="text-lg font-bold">Preview</h2>
        {invoiceDetail && settings && (
          <div className="ring-1 ring-gray-200 rounded-md">
            <InvoicePdf invoiceDetail={invoiceDetail} settings={settings} />
          </div>
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
