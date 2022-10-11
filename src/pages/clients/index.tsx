import Layout from '@components/Layout';
import { NextPage } from 'next';

const ClientsIndex: NextPage = () => {
  return (
    <Layout>
      <div>
        <div>
          <h2>Clients</h2>
          <button type="button" className="p-3 rounded-md bg-emerald-400">
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
      </div>
    </Layout>
  );
};

export default ClientsIndex;
