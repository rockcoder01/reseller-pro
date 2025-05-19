const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.jwt');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get dashboard summary
router.get('/summary', dashboardController.getSummary);

// Get sales data
router.get('/sales', dashboardController.getSales);

// Get expenses data
router.get('/expenses', dashboardController.getExpenses);

// Get top selling products
router.get('/top-products', dashboardController.getTopProducts);

// Get expenses by category
router.get('/expenses-by-category', dashboardController.getExpensesByCategory);

// Get profit and loss data
router.get('/profit-loss', dashboardController.getProfitLoss);

module.exports = router;
