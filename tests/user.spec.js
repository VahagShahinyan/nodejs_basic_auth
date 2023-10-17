const supertest = require('supertest');
const { app } = require('../src/app');
const request = supertest(app);
const { StatusCodes } = require('http-status-codes');
const { prisma } = require('../src/prisma/prisma');
const userService = require('../src/service/user.service');
const authService = require('../src/service/auth.service');

const {
  CREATE_USER_ERROR_MSG,
  DELETE_USER_SUCCESS_MSG,
  USER_NOT_FOUND_MSG,
  USER_EMAIL_ALREADY_USED_MSG,
} = require('../src/constants/error.message');
const { userData } = require('./fixtures/user.fixture');

const createUserAndToken = async () => {
  const createUser = await userService.createUser(userData());
  const getAccessToken = await authService.generateToken({
    id: createUser.id,
    email: createUser.email,
  });
  return { createUser, getAccessToken };
};

describe('User API', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await prisma.user.deleteMany({});
  });

  describe('Creating a user', () => {
    it('should be successful', async () => {
      const response = await request.post('/user').send(userData());
      expect(response.status).toBe(StatusCodes.CREATED);
      const { id, email, name } = response.body;
      expect(id).toBeDefined();
      expect(email).toBe(userData().email);
      expect(name).toBe(userData().name);
    });
  });

  describe('When trying creating a user with missing fields', () => {
    it('should be successful', async () => {
      const response = await request.post('/user');
      expect(response.body.message).toBe(CREATE_USER_ERROR_MSG);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('Getting an existing user', () => {
    it('should be successful', async () => {
      const { createUser, getAccessToken } = await createUserAndToken();

      const response = await request
        .get(`/user/${createUser.id}`)
        .set('Authorization', `Bearer ${getAccessToken}`);

      expect(response.status).toBe(StatusCodes.OK);
      const { id, email, name } = response.body;
      expect(id).toBe(createUser.id);
      expect(email).toBe(createUser.email);
      expect(name).toBe(createUser.name);
    });
  });

  describe('Getting not existing user', () => {
    it('should be successful', async () => {
      const { createUser, getAccessToken } = await createUserAndToken();

      const response = await request
        .get('/user/' + createUser.id + 1)
        .set('Authorization', `Bearer ${getAccessToken}`);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toBe(USER_NOT_FOUND_MSG);
    });
  });

  describe('Deleting an existing user', () => {
    it('should be successful', async () => {
      const { createUser, getAccessToken } = await createUserAndToken();

      const response = await request
        .delete(`/user/${createUser.id}`)
        .set('Authorization', `Bearer ${getAccessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(DELETE_USER_SUCCESS_MSG);

      const getUser = await userService.getUserById(createUser.id);
      expect(getUser).toBeNull();
    });
  });

  describe('Deleting not existing user', () => {
    it('should be error', async () => {
      const { createUser, getAccessToken } = await createUserAndToken();

      const response = await request
        .delete('/user/' + createUser.id + 1)
        .set('Authorization', `Bearer ${getAccessToken}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toBe(USER_NOT_FOUND_MSG);
    });
  });

  describe('updating an existing user', () => {
    it('should be successful', async () => {
      const { createUser, getAccessToken } = await createUserAndToken();
      const newUserdata = userData({
        email: 'dfc@gmail.com',
        name: 'new name',
        password: 'new_password',
      });

      const response = await request
        .patch(`/user/${createUser.id}`)
        .send(newUserdata)
        .set('Authorization', `Bearer ${getAccessToken}`);
      const { id, email, name } = response.body;

      expect(id).toBeDefined();
      expect(email).toBe(newUserdata.email);
      expect(name).toBe(newUserdata.name);
    });
  });

  describe('updating an existing user then missing fields', () => {
    it('should be error', async () => {
      const { createUser, getAccessToken } = await createUserAndToken();

      const response = await request
        .patch(`/user/${createUser.id}`)
        .set('Authorization', `Bearer ${getAccessToken}`);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe(CREATE_USER_ERROR_MSG);
    });
  });

  describe('updating not existing user ', () => {
    it('should be error', async () => {
      const { createUser, getAccessToken } = await createUserAndToken();
      const response = await request
        .patch('/user/' + createUser.id + 1)
        .send(userData())
        .set('Authorization', `Bearer ${getAccessToken}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toBe(USER_NOT_FOUND_MSG);
    });
  });

  describe('updating an existing  when user email taken from an other user', () => {
    it('should be error', async () => {
      const { getAccessToken } = await createUserAndToken();
      const user2Data = userData({
        name: 'new name',
        password: 'new_password',
        email: 'dev@gmail.com',
      });
      const createUser2 = await userService.createUser(user2Data);
      user2Data.email = userData().email;

      const response = await request
        .patch(`/user/${createUser2.id}`)
        .send(user2Data)
        .set('Authorization', `Bearer ${getAccessToken}`);
      expect(response.status).toBe(StatusCodes.CONFLICT);
      expect(response.body.message).toBe(USER_EMAIL_ALREADY_USED_MSG);
    });
  });
});
