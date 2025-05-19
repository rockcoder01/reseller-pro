const dbConfig = require('../config/db.config');
const Sequelize = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    dialectOptions: dbConfig.dialectOptions
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model')(sequelize, Sequelize);
db.product = require('./product.model')(sequelize, Sequelize);
db.invoice = require('./invoice.model')(sequelize, Sequelize);
db.invoiceItem = require('./invoice-item.model')(sequelize, Sequelize);
db.expense = require('./expense.model')(sequelize, Sequelize);
db.expenseCategory = require('./expense.model')(sequelize, Sequelize).expenseCategory;
db.employee = require('./employee.model')(sequelize, Sequelize);

// Define associations
db.invoice.hasMany(db.invoiceItem, { as: 'items', foreignKey: 'invoiceId' });
db.invoiceItem.belongsTo(db.invoice, { foreignKey: 'invoiceId' });
db.invoiceItem.belongsTo(db.product, { foreignKey: 'productId' });

// Export the db object
module.exports = db;
