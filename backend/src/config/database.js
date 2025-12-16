import { Sequelize } from 'sequelize';
import env from './env.js';

const sequelize = new Sequelize(env.database.url, {
  dialect: 'postgres',
  logging: env.server.env === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log(`✅ Database synchronized ${force ? '(FORCE MODE)' : ''}`);
    return true;
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    return false;
  }
};

export default sequelize;
