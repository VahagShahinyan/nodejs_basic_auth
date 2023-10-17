const userData = (user = null) => {
  const userObject = {
    email: 'abc@gmail.com',
    password: '123',
    name: 'name',
  };
  return Object.assign(userObject, user);
};

module.exports = { userData };
