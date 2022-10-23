import type { NextPage } from 'next';
import Layout from '@components/Layout';

const Home: NextPage = () => {
  return (
    <>
      <Layout title="Dashboard">
        <h2 className="text-lg font-bold">Dashboard</h2>
      </Layout>
    </>
  );
};

export default Home;
