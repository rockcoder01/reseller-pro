const db = require('../models');
const Product = db.product;
const Op = db.Sequelize.Op;

// Create a new Product
exports.create = async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      sku: req.body.sku,
      barcode: req.body.barcode,
      category: req.body.category,
      supplier: req.body.supplier,
      brand: req.body.brand,
      purchasePrice: req.body.purchasePrice,
      sellingPrice: req.body.sellingPrice,
      quantity: req.body.quantity,
      reorderLevel: req.body.reorderLevel,
      expiryDate: req.body.expiryDate,
      imageUrl: req.body.imageUrl
    });
    
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Retrieve all Products
exports.findAll = async (req, res) => {
  try {
    const { search, category, supplier, brand, lowStock } = req.query;
    let condition = {};
    
    // Build search condition
    if (search) {
      condition = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { sku: { [Op.iLike]: `%${search}%` } },
          { barcode: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    // Add category filter
    if (category) {
      condition.category = category;
    }
    
    // Add supplier filter
    if (supplier) {
      condition.supplier = supplier;
    }
    
    // Add brand filter
    if (brand) {
      condition.brand = brand;
    }
    
    // Add low stock filter
    if (lowStock === 'true') {
      condition.quantity = {
        [Op.lte]: db.Sequelize.col('reorder_level')
      };
    }
    
    const products = await Product.findAll({ where: condition });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Find a single Product with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: `Product with id=${id} not found` });
    }
    
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a Product by id
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [num, updatedProduct] = await Product.update(req.body, {
      where: { id: id },
      returning: true
    });
    
    if (num === 0) {
      return res.status(404).json({ message: `Product with id=${id} not found` });
    }
    
    res.status(200).json(updatedProduct[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a Product with id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await Product.destroy({
      where: { id: id }
    });
    
    if (num === 0) {
      return res.status(404).json({ message: `Product with id=${id} not found` });
    }
    
    res.status(200).json({ message: 'Product was deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get low stock products
exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        quantity: {
          [Op.lte]: db.Sequelize.col('reorder_level')
        }
      }
    });
    
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unique categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('category')), 'category']],
      where: {
        category: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      }
    });
    
    const categoryList = categories.map(item => item.category);
    res.status(200).json(categoryList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unique suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Product.findAll({
      attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('supplier')), 'supplier']],
      where: {
        supplier: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      }
    });
    
    const supplierList = suppliers.map(item => item.supplier);
    res.status(200).json(supplierList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unique brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.findAll({
      attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('brand')), 'brand']],
      where: {
        brand: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      }
    });
    
    const brandList = brands.map(item => item.brand);
    res.status(200).json(brandList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
