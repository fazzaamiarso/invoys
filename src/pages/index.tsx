import type { NextPage } from 'next';
import Layout from '@components/Layout';

const Home: NextPage = () => {
  return (
    <>
      <Layout title="Dashboard">
        <div className="p-12">
          <h2 className="text-3xl font-bold">Dashboard</h2>
        </div>
      </Layout>
    </>
  );
};

export default Home;
