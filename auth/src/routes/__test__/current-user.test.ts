import request from 'supertest';
import { app } from '../../app';

it('Responds with details of current user', async () => {
  const cookie = await global.getAuth();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);
  
    expect(response.body.currentUser.email).toEqual(
      'testly@test.com'
    )
});

it('Responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
})