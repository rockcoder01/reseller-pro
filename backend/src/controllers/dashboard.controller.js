const db = require('../models');
const Invoice = db.invoice;
const InvoiceItem = db.invoiceItem;
const Product = db.product;
const Expense = db.expense.Expense;

// Get dashboard summary
exports.getSummary = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Get total sales today
    const totalSalesToday = await Invoice.sum('total', {
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: today
        }
      }
    }) || 0;
    
    // Get total sales this month
    const totalSalesMonth = await Invoice.sum('total', {
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }
      }
    }) || 0;
    
    // Get total expenses this month
    const totalExpensesMonth = await Expense.sum('amount', {
      where: {
        date: {
          [db.Sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }
      }
    }) || 0;
    
    // Calculate net profit
    const netProfit = totalSalesMonth - totalExpensesMonth;
    
    // Get low stock count
    const lowStockCount = await Product.count({
      where: {
        quantity: {
          [db.Sequelize.Op.lte]: db.Sequelize.col('reorder_level')
        }
      }
    });
    
    // Get pending invoices count
    const pendingInvoicesCount = await Invoice.count({
      where: {
        paymentStatus: {
          [db.Sequelize.Op.ne]: 'paid'
        }
      }
    });
    
    // Get total products
    const totalProducts = await Product.count();
    
    // Get top selling products
    const products = await Product.findAll();
    const topSellingProducts = products.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      quantitySold: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 10000) + 5000
    }));
    
    // Get recent invoices
    const recentInvoices = await Invoice.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Generate sample sales data
    const salesByPeriod = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      
      salesByPeriod.push({
        label: date.toLocaleString('default', { month: 'short' }),
        sales: Math.floor(Math.random() * 10000) + 5000,
      });
    }
    
    // Generate sample expense data
    const categories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Inventory', 'Miscellaneous'];
    const expensesByCategory = categories.map(category => ({
      category,
      amount: Math.floor(Math.random() * 5000) + 1000
    }));
    
    // Construct and return the summary
    const summary = {
      totalSalesToday,
      totalSalesMonth,
      totalExpensesMonth,
      netProfit,
      lowStockCount,
      pendingInvoicesCount,
      totalProducts,
      topSellingProducts,
      recentInvoices,
      salesByPeriod: salesByPeriod.reverse(),
      expensesByCategory
    };
    
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sales data
exports.getSales = async (req, res) => {
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
        sales: Math.floor(Math.random() * 10000) + 5000,
      });
    }
    
    res.status(200).json(data.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expenses data
exports.getExpenses = async (req, res) => {
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

// Get top selling products
exports.getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Get products (we'll simulate top sellers)
    const products = await Product.findAll({
      limit: limit
    });
    
    // Map to top selling format
    const topProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      quantitySold: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 10000) + 5000
    }));
    
    res.status(200).json(topProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expenses by category
exports.getExpensesByCategory = async (req, res) => {
  try {
    // Generate sample data for now
    const categories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Inventory', 'Miscellaneous'];
    const data = categories.map(category => ({
      category,
      amount: Math.floor(Math.random() * 5000) + 1000
    }));
    
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get profit and loss data
exports.getProfitLoss = async (req, res) => {
  try {
    const period = req.query.period || 'monthly';
    
    // Generate sample data for now
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      
      const sales = Math.floor(Math.random() * 10000) + 5000;
      const expenses = Math.floor(Math.random() * 5000) + 1000;
      
      data.push({
        label: date.toLocaleString('default', { month: 'short' }),
        sales,
        expenses,
        profit: sales - expenses
      });
    }
    
    res.status(200).json(data.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
