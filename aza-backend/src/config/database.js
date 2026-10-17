const { Sequelize } = require('sequelize');
const env = require('./env');

const { databaseTls } = require('./databaseTls');
const dialectOptions = databaseTls(env.db);

const sequelize = env.db.url
  ? new Sequelize(env.db.url, {
      dialect: 'postgres',
      logging: false,
      dialectOptions,
    })
  : new Sequelize(env.db.name, env.db.user, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      dialect: 'postgres',
      logging: false,
      dialectOptions,
    });

module.exports = sequelize;
