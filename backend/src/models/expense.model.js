module.exports = (sequelize, Sequelize) => {
  const ExpenseCategory = sequelize.define('expense_category', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT
    }
  }, {
    timestamps: true,
    underscored: true
  });

  const Expense = sequelize.define('expense', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    isRecurring: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    recurringFrequency: {
      type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'yearly')
    },
    notes: {
      type: Sequelize.TEXT
    },
    receiptImageUrl: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return { Expense, expenseCategory: ExpenseCategory };
};
