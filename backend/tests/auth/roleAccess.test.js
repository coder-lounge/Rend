const request = require('supertest');
const app = require('../../app'); 
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Helper to generate token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
};

describe('Role-based Access Control', () => {
  let creatorToken, reviewerToken;

  beforeAll(async () => {
    const creator = await User.create({ role: 'creator', email: 'c@example.com' });
    const reviewer = await User.create({ role: 'reviewer', email: 'r@example.com' });

    creatorToken = `Bearer ${generateToken(creator._id)}`;
    reviewerToken = `Bearer ${generateToken(reviewer._id)}`;
  });

  test('Should allow creator access to /upload', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', creatorToken);
    expect(res.statusCode).toBe(200);
  });

  test('Should block reviewer from /upload', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', reviewerToken);
    expect(res.statusCode).toBe(403);
  });

  test('Should allow reviewer access to /review', async () => {
    const res = await request(app)
      .post('/api/review')
      .set('Authorization', reviewerToken);
    expect(res.statusCode).toBe(200);
  });

  test('Should block creator from /review', async () => {
    const res = await request(app)
      .post('/api/review')
      .set('Authorization', creatorToken);
    expect(res.statusCode).toBe(403);
  });

  test('Should fail if role is missing or invalid', async () => {
    const invalidToken = `Bearer ${jwt.sign({ id: mongoose.Types.ObjectId() }, process.env.JWT_SECRET)}`;
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', invalidToken);
    expect(res.statusCode).toBe(401); // or 403 depending on if user is found
  });
});
