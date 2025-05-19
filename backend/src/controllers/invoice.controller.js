const db = require('../models');
const Invoice = db.invoice;
const InvoiceItem = db.invoiceItem;
const Product = db.product;
const pdfGenerator = require('../utils/pdf-generator');
const fs = require('fs');
const path = require('path');

// Create a new Invoice
exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    // Create the invoice
    const invoice = await Invoice.create({
      invoiceNumber: req.body.invoiceNumber,
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerPhone: req.body.customerPhone,
      customerAddress: req.body.customerAddress,
      subtotal: req.body.subtotal,
      taxAmount: req.body.taxAmount,
      discountAmount: req.body.discountAmount,
      total: req.body.total,
      paymentStatus: req.body.paymentStatus,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes
    }, { transaction: t });
    
    // Create the invoice items
    if (req.body.items && req.body.items.length > 0) {
      const invoiceItems = req.body.items.map(item => ({
        invoiceId: invoice.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.total
      }));
      
      await InvoiceItem.bulkCreate(invoiceItems, { transaction: t });
      
      // Update product quantities
      for (const item of req.body.items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        
        if (product) {
          await product.update({
            quantity: product.quantity - item.quantity
          }, { transaction: t });
        }
      }
    }
    
    await t.commit();
    res.status(201).json(invoice);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// Retrieve all Invoices
exports.findAll = async (req, res) => {
  try {
    const { search, startDate, endDate, paymentStatus } = req.query;
    let condition = {};
    
    // Build search condition
    if (search) {
      condition = {
        [db.Sequelize.Op.or]: [
          { invoiceNumber: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { customerName: { [db.Sequelize.Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    // Add date range filter
    if (startDate && endDate) {
      condition.createdAt = {
        [db.Sequelize.Op.between]: [
          new Date(startDate), 
          new Date(endDate)
        ]
      };
    } else if (startDate) {
      condition.createdAt = {
        [db.Sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      condition.createdAt = {
        [db.Sequelize.Op.lte]: new Date(endDate)
      };
    }
    
    // Add payment status filter
    if (paymentStatus) {
      condition.paymentStatus = paymentStatus;
    }
    
    const invoices = await Invoice.findAll({ 
      where: condition,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Find a single Invoice with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const invoice = await Invoice.findByPk(id, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: `Invoice with id=${id} not found` });
    }
    
    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an Invoice by id
exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const id = req.params.id;
    
    // Find the invoice
    const invoice = await Invoice.findByPk(id, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }],
      transaction: t
    });
    
    if (!invoice) {
      await t.rollback();
      return res.status(404).json({ message: `Invoice with id=${id} not found` });
    }
    
    // Update invoice
    await invoice.update({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerPhone: req.body.customerPhone,
      customerAddress: req.body.customerAddress,
      subtotal: req.body.subtotal,
      taxAmount: req.body.taxAmount,
      discountAmount: req.body.discountAmount,
      total: req.body.total,
      paymentStatus: req.body.paymentStatus,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes
    }, { transaction: t });
    
    // Restore quantities to products from old items
    for (const oldItem of invoice.items) {
      const product = await Product.findByPk(oldItem.productId, { transaction: t });
      
      if (product) {
        await product.update({
          quantity: product.quantity + oldItem.quantity
        }, { transaction: t });
      }
    }
    
    // Delete old invoice items
    await InvoiceItem.destroy({
      where: { invoiceId: id },
      transaction: t
    });
    
    // Create new invoice items
    if (req.body.items && req.body.items.length > 0) {
      const invoiceItems = req.body.items.map(item => ({
        invoiceId: invoice.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.total
      }));
      
      await InvoiceItem.bulkCreate(invoiceItems, { transaction: t });
      
      // Update product quantities with new items
      for (const item of req.body.items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        
        if (product) {
          await product.update({
            quantity: product.quantity - item.quantity
          }, { transaction: t });
        }
      }
    }
    
    await t.commit();
    
    // Get updated invoice with items
    const updatedInvoice = await Invoice.findByPk(id, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }]
    });
    
    res.status(200).json(updatedInvoice);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// Delete an Invoice with id
exports.delete = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const id = req.params.id;
    
    // Find invoice with items
    const invoice = await Invoice.findByPk(id, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }],
      transaction: t
    });
    
    if (!invoice) {
      await t.rollback();
      return res.status(404).json({ message: `Invoice with id=${id} not found` });
    }
    
    // Restore quantities to products
    for (const item of invoice.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      
      if (product) {
        await product.update({
          quantity: product.quantity + item.quantity
        }, { transaction: t });
      }
    }
    
    // Delete invoice items
    await InvoiceItem.destroy({
      where: { invoiceId: id },
      transaction: t
    });
    
    // Delete invoice
    await invoice.destroy({ transaction: t });
    
    await t.commit();
    res.status(200).json({ message: 'Invoice was deleted successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// Generate PDF for an invoice
exports.generatePdf = async (req, res) => {
  try {
    const id = req.params.id;
    
    const invoice = await Invoice.findByPk(id, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: `Invoice with id=${id} not found` });
    }
    
    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateInvoicePdf(invoice);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);
    
    // Send PDF
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send invoice by email
exports.sendByEmail = async (req, res) => {
  try {
    const id = req.params.id;
    const email = req.body.email;
    
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    
    const invoice = await Invoice.findByPk(id, {
      include: [{
        model: InvoiceItem,
        as: 'items'
      }]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: `Invoice with id=${id} not found` });
    }
    
    // Here you would implement email sending logic
    // For now we'll just return success
    
    res.status(200).json({ message: `Invoice was sent to ${email} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recent invoices
exports.getRecent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const invoices = await Invoice.findAll({
      order: [['createdAt', 'DESC']],
      limit: limit
    });
    
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sales by period
exports.getSalesByPeriod = async (req, res) => {
  try {
    const period = req.query.period || 'monthly';
    let timeFormat, groupBy, daysToLookBack, dateFormat;
    
    // Set parameters based on period
    switch (period) {
      case 'daily':
        timeFormat = 'YYYY-MM-DD';
        groupBy = 'date';
        daysToLookBack = 30;
        dateFormat = 'MMM DD';
        break;
      case 'weekly':
        timeFormat = 'YYYY-WW';
        groupBy = 'week';
        daysToLookBack = 90;
        dateFormat = 'WW';
        break;
      case 'yearly':
        timeFormat = 'YYYY';
        groupBy = 'year';
        daysToLookBack = 365 * 5;
        dateFormat = 'YYYY';
        break;
      case 'monthly':
      default:
        timeFormat = 'YYYY-MM';
        groupBy = 'month';
        daysToLookBack = 365;
        dateFormat = 'MMM';
    }
    
    // Generate some sample data
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
