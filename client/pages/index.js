import Link from 'next/link';
import buildClient from '../api/build-client';
import BaseLayout from '../components/base-layout';

const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <BaseLayout currentUser={currentUser}>
      <div>
        <h1>Tickets</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>{ticketList}</tbody>
        </table>
      </div>
    </BaseLayout>
  );
};

export const getServerSideProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return { props: { currentUser: data } };
};

export default LandingPage;
