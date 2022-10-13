import Layout from '@components/Layout';
import { trpc } from '@utils/trpc';
import Link from 'next/link';

const Invoices = () => {
  const { data: invoices } = trpc.invoice.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return (
    <Layout>
      <h2 className="text-lg font-bold">Invoices </h2>
      <ul>
        {invoices &&
          invoices.map(invoice => {
            return (
              <li key={invoice.id}>
                <div>
                  <h3>{invoice.name}</h3>
                  <span>{invoice.status.toLowerCase()}</span>
                </div>
                <span>{invoice.dueDate.toDateString()}</span>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="text-blue-500 hover:underline">
                  {invoice.customer.name}
                </Link>
                <p>{invoice.customer.email}</p>
                <p>
                  {invoice.orders.map(order => {
                    return (
                      <div key={order.id}>
                        <span>{order.name}</span>
                        <span>{order.amount}</span>
                      </div>
                    );
                  })}
                </p>
              </li>
            );
          })}
      </ul>
    </Layout>
  );
};

export default Invoices;
