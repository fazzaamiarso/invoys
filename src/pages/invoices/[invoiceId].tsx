import Layout from '@components/Layout';
import { useRouter } from 'next/router';

const InvoiceDetail = () => {
  const router = useRouter();
  const { invoiceId } = router.query;

  return (
    <Layout>
      <div>
        <h2 className="text-lg font-bold">Invoice Details - {invoiceId}</h2>
      </div>
    </Layout>
  );
};

export default InvoiceDetail;
