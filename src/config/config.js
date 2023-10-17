const config = {
  port: +process.env.PORT,
  salt: +process.env.SALT,
  secretKey: process.env.SECRET_KEY,
  bodyParserLimit: process.env.BODY_PARSER_LIMIT,
};

module.exports = { config };
