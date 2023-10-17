const { genSalt, hash } = require('bcryptjs');
const {
  USER_NOT_FOUND_MSG,
  USER_EMAIL_ALREADY_USED_MSG,
} = require('../constants/error.message');
const { prisma } = require('../prisma/prisma');
const { StatusCodes } = require('http-status-codes');
const { config } = require('../config/config');

exports.createUser = async (userData) => {
  const salt = await genSalt(config.salt);
  return prisma.user.create({
    data: {
      email: userData.email,
      password: await hash(userData.password, salt),
      name: userData.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
};

exports.getUserById = (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

exports.getUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
  });
};

exports.updateUser = async (userId, userdata) => {
  const getUser = await this.getUserById(userId);

  if (!getUser) {
    const error = new Error(USER_NOT_FOUND_MSG);
    error.status = StatusCodes.NOT_FOUND;
    throw error;
  }

  const getUserByEmail = await this.getUserByEmail(userdata.email);

  if (getUserByEmail && getUserByEmail.id !== userId) {
    const error = new Error(USER_EMAIL_ALREADY_USED_MSG);
    error.status = StatusCodes.CONFLICT;
    throw error;
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: userdata,
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
};

exports.deleteUser = async (userId) => {
  const getUser = await this.getUserById(userId);

  if (!getUser) {
    const error = new Error(USER_NOT_FOUND_MSG);
    error.status = StatusCodes.NOT_FOUND;
    throw error;
  }

  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
};
