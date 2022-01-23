import { Ticket } from '../ticket';

it('Implements optimistic concurrency control', async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save ticket to db
  await ticket.save();

  // Fetch ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make 2 separate changes to tickets
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // Save first fetched ticket
  await firstInstance!.save();

  // Save second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('Increments version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
