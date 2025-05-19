require('dotenv').config();

module.exports = {
  HOST: process.env.PGHOST || 'localhost',
  USER: process.env.PGUSER || 'postgres',
  PASSWORD: process.env.PGPASSWORD || 'password',
  DB: process.env.PGDATABASE || 'resellpro',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.DATABASE_URL ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
};
