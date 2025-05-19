const db = require('../models');
const Expense = db.expense.Expense;
const ExpenseCategory = db.expenseCategory;
const Op = db.Sequelize.Op;

// Create a new Expense
exports.create = async (req, res) => {
  try {
    const expense = await Expense.create({
      title: req.body.title,
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date,
      isRecurring: req.body.isRecurring,
      recurringFrequency: req.body.recurringFrequency,
      notes: req.body.notes,
      receiptImageUrl: req.body.receiptImageUrl
    });
    
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Retrieve all Expenses
exports.findAll = async (req, res) => {
  try {
    const { search, category, startDate, endDate } = req.query;
    let condition = {};
    
    // Build search condition
    if (search) {
      condition = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { notes: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    // Add category filter
    if (category) {
      condition.category = category;
    }
    
    // Add date range filter
    if (startDate && endDate) {
      condition.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      condition.date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      condition.date = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    const expenses = await Expense.findAll({
      where: condition,
      order: [['date', 'DESC']]
    });
    
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Find a single Expense with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const expense = await Expense.findByPk(id);
    
    if (!expense) {
      return res.status(404).json({ message: `Expense with id=${id} not found` });
    }
    
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an Expense by id
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [num, updatedExpense] = await Expense.update(req.body, {
      where: { id: id },
      returning: true
    });
    
    if (num === 0) {
      return res.status(404).json({ message: `Expense with id=${id} not found` });
    }
    
    res.status(200).json(updatedExpense[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an Expense with id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await Expense.destroy({
      where: { id: id }
    });
    
    if (num === 0) {
      return res.status(404).json({ message: `Expense with id=${id} not found` });
    }
    
    res.status(200).json({ message: 'Expense was deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new Expense Category
exports.createCategory = async (req, res) => {
  try {
    const category = await ExpenseCategory.create({
      name: req.body.name,
      description: req.body.description
    });
    
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Expense Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.findAll();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expenses by period
exports.getByPeriod = async (req, res) => {
  try {
    const period = req.query.period || 'monthly';
    
    // Generate sample data for now
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      
      data.push({
        label: date.toLocaleString('default', { month: 'short' }),
        expenses: Math.floor(Math.random() * 5000) + 1000,
      });
    }
    
    res.status(200).json(data.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expenses by category
exports.getByCategory = async (req, res) => {
  try {
    // Generate sample data for now
    const categories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Inventory', 'Miscellaneous'];
    const data = categories.map(category => ({
      category,
      amount: Math.floor(Math.random() * 10000) + 1000
    }));
    
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
