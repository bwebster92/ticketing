import request from 'supertest';
import { app } from '../../app';

it('Returns 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'testly@test.com',
      password: 'password'
    })
    .expect(201);
});

it('Returns 400 with invalid email', async () => {
  return request(app)
  .post('/api/users/signup')
  .send({
    email: 'testlytest.com',
    password: 'password'
  })
  .expect(400);
});

it('Returns 400 with invalid password', async () => {
  return request(app)
  .post('/api/users/signup')
  .send({
    email: 'testly@test.com',
    password: 'p'
  })
  .expect(400);
});

it('Returns 400 with missing email and password', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email: "testly@test.com"
  })
  .expect(400);

  await request(app)
  .post('/api/users/signup')
  .send({
    password: "password"
  })
  .expect(400);
});

it('Blocks signup with duplicate email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testly@test.com',
      password: 'password'
    })
    .expect(201);

    await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testly@test.com',
      password: 'password'
    })
    .expect(400);
});

it('Sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testly@test.com',
      password: 'password'
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});