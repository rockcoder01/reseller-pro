module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define('product', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    sku: {
      type: Sequelize.STRING
    },
    barcode: {
      type: Sequelize.STRING
    },
    category: {
      type: Sequelize.STRING
    },
    supplier: {
      type: Sequelize.STRING
    },
    brand: {
      type: Sequelize.STRING
    },
    purchasePrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    sellingPrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reorderLevel: {
      type: Sequelize.INTEGER,
      defaultValue: 5
    },
    expiryDate: {
      type: Sequelize.DATE
    },
    imageUrl: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return Product;
};
