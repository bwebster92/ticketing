import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('Returns 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.getAuth())
    .send({
      title: 'aseuhfuia',
      price: 20,
    })
    .expect(404);
});

it('Returns a 401 if user not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'aseuhfuia',
      price: 20,
    })
    .expect(401);
});

it('Returns a 401 if user does not own ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuth())
    .send({
      title: 'asdfiuo',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.getAuth())
    .send({
      title: 'asuigpauha',
      price: 200,
    })
    .expect(401);

  // Validate that ticket hasn't changed?
});

it('Returns 400 if user provides invalid title or price', async () => {
  const cookie = global.getAuth();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdfiuo',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'juiepnsru',
      price: -20,
    })
    .expect(400);
});

it('Updates ticket when provided with valid inputs', async () => {
  const cookie = global.getAuth();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdfiuo',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('new title');
  expect(ticketResponse.body.price).toEqual(100);
});

it('Publishes an event', async () => {
  const cookie = global.getAuth();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdfiuo',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Rejects updates if ticket is reserved', async () => {
  const cookie = global.getAuth();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asdfiuo',
      price: 20,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(400);
});
