const authService = require('../service/auth.service');
const { EMAIL_OR_PASS_REQUIRED } = require('../constants/error.message');
const { StatusCodes } = require('http-status-codes');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: EMAIL_OR_PASS_REQUIRED });
    }
    const getToken = await authService.login(email, password);
    res.status(StatusCodes.OK).json(getToken);
  } catch (e) {
    next(e);
  }
};
