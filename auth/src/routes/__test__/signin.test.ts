import request from 'supertest';
import { app } from '../../app';

it('Fails when nonexisting email supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'testly@test.com',
      password: 'password'
    })
    .expect(400);
});

it('Files when incorrect password supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testly@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'testly@test.com',
      password: 'wrong'
    })
    .expect(400);
});

it('Responds with cookie when valid credentials provided', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testly@test.com',
      password: 'password'
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'testly@test.com',
      password: 'password'
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});