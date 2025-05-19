const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { verifyToken } = require('../middleware/auth.jwt');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create a new invoice
router.post('/', invoiceController.create);

// Retrieve all invoices
router.get('/', invoiceController.findAll);

// Get recent invoices
router.get('/recent', invoiceController.getRecent);

// Get sales by period
router.get('/sales-by-period', invoiceController.getSalesByPeriod);

// Retrieve a single invoice by id
router.get('/:id', invoiceController.findOne);

// Generate PDF for an invoice
router.get('/:id/pdf', invoiceController.generatePdf);

// Send invoice by email
router.post('/:id/send-email', invoiceController.sendByEmail);

// Update an invoice by id
router.put('/:id', invoiceController.update);

// Delete an invoice by id
router.delete('/:id', invoiceController.delete);

module.exports = router;
