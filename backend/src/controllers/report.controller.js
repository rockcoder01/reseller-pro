const db = require("../models");
const PDFGenerator = require("../utils/pdf-generator");
const Product = db.products;
const Invoice = db.invoices;
const InvoiceItem = db.invoiceItems;
const Expense = db.expenses;
const User = db.users;
const { Op } = require("sequelize");

// Get sales report by date range
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: InvoiceItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate summary data
    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalInvoices = invoices.length;
    const averageSale = totalInvoices > 0 ? totalSales / totalInvoices : 0;
    
    // Calculate product-wise sales
    const productSales = {};
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productName: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.total;
      });
    });
    
    const productSalesArray = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue);
    
    res.status(200).json({
      summary: {
        totalSales,
        totalInvoices,
        averageSale,
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        }
      },
      invoices,
      productSales: productSalesArray
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving sales report",
      error: error.message
    });
  }
};

// Get expense report by date range
exports.getExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const expenses = await Expense.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    
    // Calculate summary data
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Group expenses by category
    const expensesByCategory = {};
    
    expenses.forEach(expense => {
      const category = expense.category;
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += expense.amount;
    });
    
    const expenseCategoriesArray = Object.keys(expensesByCategory).map(category => ({
      category,
      amount: expensesByCategory[category]
    })).sort((a, b) => b.amount - a.amount);
    
    res.status(200).json({
      summary: {
        totalExpenses,
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        }
      },
      expenses,
      expensesByCategory: expenseCategoriesArray
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving expense report",
      error: error.message
    });
  }
};

// Get profit/loss report
exports.getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Define date range filters
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter[Op.between] = [new Date(startDate), new Date(endDate)];
    }
    
    // Get all invoices in date range
    const invoices = await Invoice.findAll({
      where: { createdAt: dateFilter },
      include: [
        {
          model: InvoiceItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });
    
    // Get all expenses in date range
    const expenses = await Expense.findAll({
      where: { date: dateFilter }
    });
    
    // Calculate revenue
    const revenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    // Calculate cost of goods sold (COGS)
    let cogs = 0;
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (item.product) {
          // Use purchase price from the product as the cost
          cogs += (item.product.purchasePrice || 0) * item.quantity;
        }
      });
    });
    
    // Calculate gross profit
    const grossProfit = revenue - cogs;
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate net profit
    const netProfit = grossProfit - totalExpenses;
    
    // Group expenses by category
    const expensesByCategory = {};
    
    expenses.forEach(expense => {
      const category = expense.category;
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += expense.amount;
    });
    
    // Convert to array and sort
    const expenseCategoriesArray = Object.keys(expensesByCategory).map(category => ({
      category,
      amount: expensesByCategory[category]
    })).sort((a, b) => b.amount - a.amount);
    
    res.status(200).json({
      summary: {
        revenue,
        cogs,
        grossProfit,
        grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        totalExpenses,
        netProfit,
        netProfitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        }
      },
      expensesByCategory: expenseCategoriesArray
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving profit/loss report",
      error: error.message
    });
  }
};

// Get inventory value report
exports.getInventoryReport = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    
    // Calculate total inventory value
    const totalInventoryValue = products.reduce((sum, product) => {
      return sum + (product.purchasePrice * product.quantity);
    }, 0);
    
    // Calculate retail value (potential revenue)
    const potentialRevenue = products.reduce((sum, product) => {
      return sum + (product.sellingPrice * product.quantity);
    }, 0);
    
    // Calculate potential profit
    const potentialProfit = potentialRevenue - totalInventoryValue;
    
    // Group products by category
    const productsByCategory = {};
    
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!productsByCategory[category]) {
        productsByCategory[category] = {
          count: 0,
          value: 0,
          items: []
        };
      }
      productsByCategory[category].count += 1;
      productsByCategory[category].value += (product.purchasePrice * product.quantity);
      productsByCategory[category].items.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        totalValue: product.purchasePrice * product.quantity
      });
    });
    
    // Find low stock products
    const lowStockProducts = products
      .filter(product => product.reorderLevel && product.quantity <= product.reorderLevel)
      .map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        reorderLevel: product.reorderLevel
      }));
    
    res.status(200).json({
      summary: {
        totalProducts: products.length,
        totalInventoryValue,
        potentialRevenue,
        potentialProfit,
        potentialProfitMargin: potentialRevenue > 0 ? (potentialProfit / potentialRevenue) * 100 : 0
      },
      productsByCategory,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving inventory report",
      error: error.message
    });
  }
};

// Generate PDF report
exports.generateReportPdf = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    let reportData;
    let title;
    
    // Get report data based on type
    switch (reportType) {
      case 'sales':
        // Create a mock response object to collect the JSON data
        const salesMockRes = { 
          json: (data) => { reportData = data; }
        };
        await exports.getSalesReport(req, salesMockRes);
        title = 'Sales Report';
        break;
      case 'expenses':
        const expenseMockRes = { 
          json: (data) => { reportData = data; }
        };
        await exports.getExpenseReport(req, expenseMockRes);
        title = 'Expense Report';
        break;
      case 'profit-loss':
        const plMockRes = { 
          json: (data) => { reportData = data; }
        };
        await exports.getProfitLossReport(req, plMockRes);
        title = 'Profit & Loss Report';
        break;
      case 'inventory':
        const invMockRes = { 
          json: (data) => { reportData = data; }
        };
        await exports.getInventoryReport(req, invMockRes);
        title = 'Inventory Report';
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    // Generate PDF file
    const pdfBuffer = await PDFGenerator.generateReportPdf(title, reportData, startDate, endDate);
    
    // Send PDF as response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${reportType}-report.pdf`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      message: "Error generating PDF report",
      error: error.message
    });
  }
};