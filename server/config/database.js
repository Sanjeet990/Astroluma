const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../../storage/development.sqlite'),
    logging: true
  },
  test: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../../storage/test.sqlite'),
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../../storage/production.sqlite'),
    logging: false
  }
};