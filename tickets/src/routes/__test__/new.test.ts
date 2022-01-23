import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('Has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('Can only be accessed if user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({}).expect(401);
});

it('Returns status other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuth())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('Returns error if title is invalid', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuth())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuth())
    .send({
      price: 10,
    })
    .expect(400);
});

it('Returns error if price is invalid', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuth())
    .send({
      title: 'assfhhj',
      price: -10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuth())
    .send({
      title: 'assfhhj',
    })
    .expect(400);
});

it('Creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'asdiofhga';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuth())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(20);
});

it('Publishes an event', async () => {
  const title = 'asdiofhga';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuth())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
