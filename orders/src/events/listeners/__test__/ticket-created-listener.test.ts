import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@bwebtickets/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Messsage = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('Creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with data and message objects
  await listener.onMessage(data, msg);

  // Write assertions to make sure ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('Acknowledges the message', async () => {
  const { data, listener, msg } = await setup();

  // Call the onMessage function with data and message objects
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
