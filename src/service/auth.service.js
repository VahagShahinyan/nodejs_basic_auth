const { USER_NOT_FOUND_MSG } = require('../constants/error.message');
const userService = require('./user.service');
const HOUR = 3600; // second
const DAY = 24 * HOUR;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const { config } = require('../config/config');

exports.login = async (email, password) => {
  const getUser = await userService.getUserByEmail(email);
  if (!getUser) {
    const error = new Error(USER_NOT_FOUND_MSG);
    error.status = StatusCodes.NOT_FOUND;
    throw error;
  }

  const isCorrect = await isCorrectPassword(password, getUser.password);

  if (!isCorrect) {
    const error = new Error(USER_NOT_FOUND_MSG);
    error.status = StatusCodes.UNAUTHORIZED;
    throw error;
  }

  const payload = { email, id: getUser.id };

  return {
    accessToken: await this.generateToken(payload, DAY),
    accessTokenExpiresIn: expirationDate(DAY),
  };
};

exports.generateToken = async (payload, expiresIn = DAY) => {
  return jwt.sign(payload, config.secretKey, { expiresIn });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, config.secretKey);
  } catch {
    return null;
  }
};

function isCorrectPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function expirationDate(expiresIn) {
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
  return expirationDate;
}
