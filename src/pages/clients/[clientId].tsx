import Layout from '@components/Layout';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const ClientDetails: NextPage = () => {
  const router = useRouter();
  const { clientId } = router.query;
  if (!clientId || typeof clientId !== 'string')
    throw Error(`Client with Id: ${clientId} doesn't exist`);

  return (
    <Layout>
      <div>
        <h2>{clientId}</h2>
      </div>
    </Layout>
  );
};

export default ClientDetails;
