require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./route/user.route');
const authRoute = require('./route/auth.route');
require('./prisma/prisma');
const { StatusCodes } = require('http-status-codes');
const app = express();
const { config } = require('../src/config/config');

app.use(cors());
app.disable('x-powered-by');
app.use(bodyParser.json({ limit: config.bodyParserLimit }));

app.use('/user', userRoute);
app.use('/auth', authRoute);

app.use('*', (req, res) => {
  res.json({ message: 'Route not found' }).status(StatusCodes.NOT_FOUND);
});

app.use((err, req, res, next) => {
  const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message: message });
});

module.exports = { app };
