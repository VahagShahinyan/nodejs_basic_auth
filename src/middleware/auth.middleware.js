const authService = require('../service/auth.service');
const { StatusCodes } = require('http-status-codes');

async function authMiddleware(req, res, next) {
  const token = req.header('Authorization');
  if (token == null) return res.sendStatus(401);
  const payload = authService.verifyToken(token.split('Bearer ')[1]);
  if (!payload) {
    return res.sendStatus(StatusCodes.FORBIDDEN);
  }

  req.userId = payload.id;
  next();
}

module.exports = authMiddleware;
