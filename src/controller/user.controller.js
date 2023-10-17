const userService = require('../service/user.service');
const {
  CREATE_USER_ERROR_MSG,
  USER_NOT_FOUND_MSG,
  DELETE_USER_SUCCESS_MSG,
} = require('../constants/error.message');
const { StatusCodes } = require('http-status-codes');

exports.createUser = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: CREATE_USER_ERROR_MSG });
    }

    const newUser = await userService.createUser({ email, password, name });
    res.status(StatusCodes.CREATED).json(newUser);
  } catch (e) {
    next(e);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const id = +req.params.id;
    const getUser = await userService.getUserById(id);

    if (!getUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: USER_NOT_FOUND_MSG });
    }
    res.status(StatusCodes.OK).json(getUser);
  } catch (e) {
    next(e);
  }
};

exports.deleteUserById = async (req, res, next) => {
  try {
    const userId = +req.params.id;
    await userService.deleteUser(userId);
    res.status(StatusCodes.OK).json({ message: DELETE_USER_SUCCESS_MSG });
  } catch (e) {
    next(e);
  }
};

exports.updateUserById = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const id = +req.params.id;

    if (!name || !password || !email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: CREATE_USER_ERROR_MSG });
    }
    const updatedUser = await userService.updateUser(id, {
      name,
      email,
      password,
    });

    res.status(StatusCodes.OK).json(updatedUser);
  } catch (e) {
    next(e);
  }
};
