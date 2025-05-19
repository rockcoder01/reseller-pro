const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken } = require('../middleware/auth.jwt');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create a new product
router.post('/', productController.create);

// Retrieve all products
router.get('/', productController.findAll);

// Retrieve a single product by id
router.get('/:id', productController.findOne);

// Update a product by id
router.put('/:id', productController.update);

// Delete a product by id
router.delete('/:id', productController.delete);

// Get low stock products
router.get('/low-stock', productController.getLowStock);

// Get unique categories
router.get('/categories', productController.getCategories);

// Get unique suppliers
router.get('/suppliers', productController.getSuppliers);

// Get unique brands
router.get('/brands', productController.getBrands);

module.exports = router;
