require('dotenv').config();
const { config } = require('../src/config/config');
const { app } = require('./app');
app.listen(config.port, () => console.info(`Server started at ${config.port}`));
