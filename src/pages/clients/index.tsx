import Button from '@components/Button';
import Layout from '@components/Layout';
import NewClientDrawer from '@components/NewClientDrawer';
import { PlusIcon } from '@heroicons/react/24/solid';
import { trpc } from '@utils/trpc';
import { NextPage } from 'next';
import { useState } from 'react';

const ClientsIndex: NextPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: clients, isLoading } = trpc.customer.getAll.useQuery();

  return (
    <Layout>
      <div>
        <div>
          <h2>Clients</h2>
          <Button Icon={PlusIcon} onClick={() => setIsDrawerOpen(true)}>
            Add Client
          </Button>
        </div>
        <section>
          {isLoading && <div>Loading Client...</div>}
          <ul>
            <li>
              <h3>Jujutsu.co</h3>
              <div>jujutsu@gmail.com</div>
              <div>39146747676</div>
              <address>373-1222, Chudoji Mibugawacho, Shimogyo-ku-shi</address>
            </li>
            {clients &&
              clients.map(c => {
                return (
                  <li key={c.id}>
                    <h3>{c.name}</h3>
                    <div>{c.email}</div>
                    <div>{c.phoneNumber}</div>
                    {c.address && <address>{c.address}</address>}
                  </li>
                );
              })}
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
