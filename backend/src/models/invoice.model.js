module.exports = (sequelize, Sequelize) => {
  const Invoice = sequelize.define('invoice', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoiceNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    customerId: {
      type: Sequelize.INTEGER
    },
    customerName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    customerEmail: {
      type: Sequelize.STRING
    },
    customerPhone: {
      type: Sequelize.STRING
    },
    customerAddress: {
      type: Sequelize.TEXT
    },
    subtotal: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    taxAmount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    discountAmount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    paymentStatus: {
      type: Sequelize.ENUM('paid', 'partial', 'unpaid'),
      defaultValue: 'unpaid'
    },
    paymentMethod: {
      type: Sequelize.STRING
    },
    notes: {
      type: Sequelize.TEXT
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return Invoice;
};
