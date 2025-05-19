module.exports = (sequelize, Sequelize) => {
  const InvoiceItem = sequelize.define('invoice_item', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoiceId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'invoices',
        key: 'id'
      }
    },
    productId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    productName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unitPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    discount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    tax: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return InvoiceItem;
};
