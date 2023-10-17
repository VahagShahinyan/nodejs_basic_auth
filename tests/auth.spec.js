const supertest = require('supertest');
const { app } = require('../src/app');
const request = supertest(app);
const { StatusCodes } = require('http-status-codes');
const { prisma } = require('../src/prisma/prisma');

const userService = require('../src/service/user.service');
const {
  EMAIL_OR_PASS_REQUIRED,
  USER_NOT_FOUND_MSG,
} = require('../src/constants/error.message');
const { userData } = require('./fixtures/user.fixture');

describe('Auth API', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await prisma.user.deleteMany({});
  });

  describe('When trying login  an existing user', () => {
    it('should be successful', async () => {
      await userService.createUser(userData());
      const response = await request.post('/auth/login').send({
        email: userData().email,
        password: userData().password,
      });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessTokenExpiresIn).toBeDefined();
    });
  });

  describe('When trying login in with missing fields', () => {
    it('should be error', async () => {
      const response = await request.post('/auth/login').send();
      expect(response.body.message).toBe(EMAIL_OR_PASS_REQUIRED);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('When trying login in not existing user', () => {
    it('should be error', async () => {
      const response = await request.post('/auth/login').send({
        email: userData().email,
        password: userData().password,
      });
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toBe(USER_NOT_FOUND_MSG);
    });
  });

  describe('When trying login with wrong password', () => {
    it('should be error', async () => {
      await userService.createUser(userData());
      const response = await request.post('/auth/login').send({
        email: userData().email,
        password: userData().password + 'prefix',
      });
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).toBe(USER_NOT_FOUND_MSG);
    });
  });
});
