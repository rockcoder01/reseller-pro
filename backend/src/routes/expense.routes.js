const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyToken } = require('../middleware/auth.jwt');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create a new expense
router.post('/', expenseController.create);

// Retrieve all expenses
router.get('/', expenseController.findAll);

// Get expenses by period
router.get('/by-period', expenseController.getByPeriod);

// Get expenses by category
router.get('/by-category', expenseController.getByCategory);

// Get expense categories
router.get('/categories', expenseController.getCategories);

// Create a new expense category
router.post('/categories', expenseController.createCategory);

// Retrieve a single expense by id
router.get('/:id', expenseController.findOne);

// Update an expense by id
router.put('/:id', expenseController.update);

// Delete an expense by id
router.delete('/:id', expenseController.delete);

module.exports = router;
