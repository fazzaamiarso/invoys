import Layout from '@components/Layout';
import NewClientDrawer from '@components/NewClientDrawer';
import { NextPage } from 'next';
import { useState } from 'react';

const ClientsIndex: NextPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <Layout>
      <div>
        <div>
          <h2>Clients</h2>
          <button
            type="button"
            className="p-3 rounded-md bg-emerald-400"
            onClick={() => setIsDrawerOpen(true)}>
            + Add Client
          </button>
        </div>
        <section>
          <ul>
            <li>
              <h3>Jujutsu.co</h3>
              <div>jujutsu@gmail.com</div>
              <div>39146747676</div>
              <div>Pending</div>
              <div>373-1222, Chudoji Mibugawacho, Shimogyo-ku-shi</div>
            </li>
          </ul>
        </section>
        <NewClientDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default ClientsIndex;
