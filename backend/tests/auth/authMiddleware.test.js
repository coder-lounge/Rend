const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');

// Mock tokens with roles
const mockToken = (role) =>
  jwt.sign({ id: 'fakeUserId' }, process.env.JWT_SECRET || 'testsecret');

// Mock user role injection
jest.mock('../../models/User', () => ({
  findById: jest.fn((id) =>
    Promise.resolve({ _id: id, role: id === 'creatorToken' ? 'creator' : 'reviewer' })
  )
}));

describe('Role-based access middleware', () => {
  it('✅ Allows creator to access /upload', async () => {
    const token = mockToken('creatorToken');
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).not.toBe(403);
  });

  it('✅ Allows reviewer to access /review', async () => {
    const token = mockToken('reviewerToken');
    const res = await request(app)
      .post('/review')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).not.toBe(403);
  });

  it('❌ Blocks reviewer from /upload', async () => {
    const token = mockToken('reviewerToken');
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ Blocks creator from /review', async () => {
    const token = mockToken('creatorToken');
    const res = await request(app)
      .post('/review')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ Blocks request with invalid or missing role', async () => {
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer invalidtoken`);
    expect(res.statusCode).toBe(401);
  });
});
