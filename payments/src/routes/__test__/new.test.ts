import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@bwebtickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('Returns 404 when purchasing non-existing order', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuth())
    .send({
      token: 'faketoken',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns 401 when purchasing order belonging to another user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuth())
    .send({
      token: 'faketoken',
      orderId: order.id,
    })
    .expect(401);
});

it('Returns 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuth(userId))
    .send({
      orderId: order.id,
      token: 'faketoken',
    })
    .expect(400);
});

it('Returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuth(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('aud');
  expect(stripeCharge!.amount).toEqual(price * 100);

  const payment = await Payment.findOne({
    StripeId: stripeCharge!.id,
    orderId: order.id,
  });
  expect(payment).not.toBeNull();
});
