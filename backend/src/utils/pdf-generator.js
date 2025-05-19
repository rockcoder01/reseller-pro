const PDFDocument = require('pdfkit');

// Generate PDF for an invoice
const generateInvoicePdf = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Create a buffer to store the PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Add company information
      doc.fontSize(20).text('ReSellPro', { align: 'center' });
      doc.fontSize(12).text('Smart Business Hub for Resellers', { align: 'center' });
      doc.moveDown();
      
      // Add invoice details
      doc.fontSize(16).text('INVOICE', { align: 'center' });
      doc.moveDown();
      
      // Invoice header
      doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
      doc.fontSize(10).text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();
      
      // Customer information
      doc.fontSize(12).text('Bill To:');
      doc.fontSize(10).text(invoice.customerName);
      if (invoice.customerAddress) doc.text(invoice.customerAddress);
      if (invoice.customerEmail) doc.text(`Email: ${invoice.customerEmail}`);
      if (invoice.customerPhone) doc.text(`Phone: ${invoice.customerPhone}`);
      doc.moveDown();
      
      // Create table headers
      const tableTop = doc.y;
      doc.fontSize(10);
      
      // Item headers
      doc.text('Item', 50, tableTop);
      doc.text('Quantity', 250, tableTop);
      doc.text('Unit Price', 350, tableTop);
      doc.text('Total', 450, tableTop);
      
      // Draw line under headers
      doc.moveTo(50, tableTop + 15)
         .lineTo(550, tableTop + 15)
         .stroke();
      
      let tablePosition = tableTop + 25;
      
      // Add invoice items
      invoice.items.forEach(item => {
        doc.text(item.productName, 50, tablePosition);
        doc.text(item.quantity.toString(), 250, tablePosition);
        doc.text(`₹${item.unitPrice.toFixed(2)}`, 350, tablePosition);
        doc.text(`₹${item.total.toFixed(2)}`, 450, tablePosition);
        
        tablePosition += 20;
      });
      
      // Draw line at the end of items list
      doc.moveTo(50, tablePosition)
         .lineTo(550, tablePosition)
         .stroke();
      
      tablePosition += 20;
      
      // Add invoice summary
      doc.text('Subtotal:', 350, tablePosition);
      doc.text(`₹${invoice.subtotal.toFixed(2)}`, 450, tablePosition);
      
      tablePosition += 20;
      
      if (invoice.discountAmount && invoice.discountAmount > 0) {
        doc.text('Discount:', 350, tablePosition);
        doc.text(`₹${invoice.discountAmount.toFixed(2)}`, 450, tablePosition);
        tablePosition += 20;
      }
      
      if (invoice.taxAmount && invoice.taxAmount > 0) {
        doc.text('Tax:', 350, tablePosition);
        doc.text(`₹${invoice.taxAmount.toFixed(2)}`, 450, tablePosition);
        tablePosition += 20;
      }
      
      // Draw line before total
      doc.moveTo(350, tablePosition)
         .lineTo(550, tablePosition)
         .stroke();
      
      tablePosition += 10;
      
      // Total
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total:', 350, tablePosition);
      doc.text(`₹${invoice.total.toFixed(2)}`, 450, tablePosition);
      doc.font('Helvetica');
      
      tablePosition += 30;
      
      // Payment status
      doc.fontSize(10);
      doc.text(`Payment Status: ${invoice.paymentStatus ? invoice.paymentStatus.toUpperCase() : 'UNPAID'}`, 50, tablePosition);
      
      if (invoice.paymentMethod) {
        tablePosition += 20;
        doc.text(`Payment Method: ${invoice.paymentMethod}`, 50, tablePosition);
      }
      
      tablePosition += 30;
      
      // Notes
      if (invoice.notes) {
        doc.fontSize(10);
        doc.text('Notes:', 50, tablePosition);
        tablePosition += 15;
        doc.text(invoice.notes, 50, tablePosition, { width: 500 });
      }
      
      tablePosition += 40;
      
      // Footer
      doc.fontSize(10);
      doc.text('Thank you for your business!', { align: 'center' });
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate PDF for a report
const generateReportPdf = async (title, reportData, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Create a buffer to store the PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Add company information
      doc.fontSize(20).text('ReSellPro', { align: 'center' });
      doc.fontSize(12).text('Smart Business Hub for Resellers', { align: 'center' });
      doc.moveDown();
      
      // Add report title
      doc.fontSize(16).text(title, { align: 'center' });
      doc.moveDown();
      
      // Add date range
      if (startDate && endDate) {
        doc.fontSize(10).text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, { align: 'center' });
        doc.moveDown();
      }
      
      // Add generation date
      doc.fontSize(10).text(`Report Generated: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown(2);
      
      // Different rendering based on report type
      if (title === 'Sales Report') {
        renderSalesReport(doc, reportData);
      } else if (title === 'Expense Report') {
        renderExpenseReport(doc, reportData);
      } else if (title === 'Profit & Loss Report') {
        renderProfitLossReport(doc, reportData);
      } else if (title === 'Inventory Report') {
        renderInventoryReport(doc, reportData);
      }
      
      // Footer
      doc.fontSize(10);
      doc.text('ReSellPro - Business Management Platform', { align: 'center' });
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to render sales report
const renderSalesReport = (doc, reportData) => {
  // Add summary section
  doc.fontSize(14).text('Summary', { underline: true });
  doc.moveDown();
  
  const { summary } = reportData;
  
  doc.fontSize(10);
  doc.text(`Total Sales: ₹${summary.totalSales.toFixed(2)}`);
  doc.text(`Total Invoices: ${summary.totalInvoices}`);
  doc.text(`Average Sale: ₹${summary.averageSale.toFixed(2)}`);
  doc.moveDown(2);
  
  // Add top products section
  doc.fontSize(14).text('Top Products by Sales', { underline: true });
  doc.moveDown();
  
  // Create table for top products
  const tableTop = doc.y;
  doc.fontSize(10);
  
  // Headers
  doc.text('Product', 50, tableTop);
  doc.text('Quantity', 280, tableTop);
  doc.text('Revenue', 450, tableTop);
  
  // Draw line under headers
  doc.moveTo(50, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();
  
  let tablePosition = tableTop + 25;
  
  // Show top 10 products or all if less than 10
  const topProducts = reportData.productSales.slice(0, 10);
  
  topProducts.forEach(product => {
    doc.text(product.productName, 50, tablePosition);
    doc.text(product.quantity.toString(), 280, tablePosition);
    doc.text(`₹${product.revenue.toFixed(2)}`, 450, tablePosition);
    
    tablePosition += 20;
  });
  
  doc.moveDown(4);
  
  // Add recent invoices section if needed
  if (reportData.invoices && reportData.invoices.length > 0) {
    doc.fontSize(14).text('Recent Invoices', { underline: true });
    doc.moveDown();
    
    // Create table for invoices
    const invoiceTableTop = doc.y;
    doc.fontSize(10);
    
    // Headers
    doc.text('Invoice #', 50, invoiceTableTop);
    doc.text('Date', 150, invoiceTableTop);
    doc.text('Customer', 250, invoiceTableTop);
    doc.text('Amount', 450, invoiceTableTop);
    
    // Draw line
    doc.moveTo(50, invoiceTableTop + 15)
       .lineTo(550, invoiceTableTop + 15)
       .stroke();
    
    let invoiceTablePosition = invoiceTableTop + 25;
    
    // List the 10 most recent invoices
    const recentInvoices = reportData.invoices.slice(0, 10);
    
    recentInvoices.forEach(invoice => {
      doc.text(invoice.invoiceNumber, 50, invoiceTablePosition);
      doc.text(new Date(invoice.createdAt).toLocaleDateString(), 150, invoiceTablePosition);
      doc.text(invoice.customerName, 250, invoiceTablePosition);
      doc.text(`₹${invoice.total.toFixed(2)}`, 450, invoiceTablePosition);
      
      invoiceTablePosition += 20;
      
      // Add page if needed
      if (invoiceTablePosition > 700) {
        doc.addPage();
        invoiceTablePosition = 50;
      }
    });
  }
};

// Helper function to render expense report
const renderExpenseReport = (doc, reportData) => {
  // Add summary section
  doc.fontSize(14).text('Summary', { underline: true });
  doc.moveDown();
  
  const { summary } = reportData;
  
  doc.fontSize(10);
  doc.text(`Total Expenses: ₹${summary.totalExpenses.toFixed(2)}`);
  doc.moveDown(2);
  
  // Add expenses by category section
  doc.fontSize(14).text('Expenses by Category', { underline: true });
  doc.moveDown();
  
  // Create table for categories
  const tableTop = doc.y;
  doc.fontSize(10);
  
  // Headers
  doc.text('Category', 50, tableTop);
  doc.text('Amount', 450, tableTop);
  
  // Draw line under headers
  doc.moveTo(50, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();
  
  let tablePosition = tableTop + 25;
  
  reportData.expensesByCategory.forEach(category => {
    doc.text(category.category, 50, tablePosition);
    doc.text(`₹${category.amount.toFixed(2)}`, 450, tablePosition);
    
    tablePosition += 20;
  });
  
  doc.moveDown(4);
  
  // Add expense details section
  if (reportData.expenses && reportData.expenses.length > 0) {
    doc.fontSize(14).text('Expense Details', { underline: true });
    doc.moveDown();
    
    // Create table for expenses
    const expenseTableTop = doc.y;
    doc.fontSize(10);
    
    // Headers
    doc.text('Date', 50, expenseTableTop);
    doc.text('Title', 150, expenseTableTop);
    doc.text('Category', 300, expenseTableTop);
    doc.text('Amount', 450, expenseTableTop);
    
    // Draw line
    doc.moveTo(50, expenseTableTop + 15)
       .lineTo(550, expenseTableTop + 15)
       .stroke();
    
    let expenseTablePosition = expenseTableTop + 25;
    
    // List expenses (up to 20 items per page)
    reportData.expenses.forEach((expense, index) => {
      if (index > 0 && index % 20 === 0) {
        doc.addPage();
        expenseTablePosition = 50;
        
        // Add headers on new page
        doc.text('Date', 50, expenseTablePosition);
        doc.text('Title', 150, expenseTablePosition);
        doc.text('Category', 300, expenseTablePosition);
        doc.text('Amount', 450, expenseTablePosition);
        
        // Draw line
        doc.moveTo(50, expenseTablePosition + 15)
           .lineTo(550, expenseTablePosition + 15)
           .stroke();
        
        expenseTablePosition += 25;
      }
      
      doc.text(new Date(expense.date).toLocaleDateString(), 50, expenseTablePosition);
      doc.text(expense.title, 150, expenseTablePosition);
      doc.text(expense.category, 300, expenseTablePosition);
      doc.text(`₹${expense.amount.toFixed(2)}`, 450, expenseTablePosition);
      
      expenseTablePosition += 20;
    });
  }
};

// Helper function to render profit/loss report
const renderProfitLossReport = (doc, reportData) => {
  // Add summary section
  doc.fontSize(14).text('Profit & Loss Summary', { underline: true });
  doc.moveDown();
  
  const { summary } = reportData;
  
  // Create table for P&L statement
  const tableTop = doc.y;
  doc.fontSize(10);
  
  // Revenue section
  doc.font('Helvetica-Bold').text('Revenue', 50, tableTop);
  doc.font('Helvetica').text(`₹${summary.revenue.toFixed(2)}`, 450, tableTop);
  
  let position = tableTop + 25;
  
  // COGS section
  doc.font('Helvetica-Bold').text('Cost of Goods Sold', 50, position);
  doc.font('Helvetica').text(`₹${summary.cogs.toFixed(2)}`, 450, position);
  
  position += 25;
  
  // Draw line before gross profit
  doc.moveTo(50, position)
     .lineTo(550, position)
     .stroke();
  
  position += 15;
  
  // Gross profit
  doc.font('Helvetica-Bold').text('Gross Profit', 50, position);
  doc.text(`₹${summary.grossProfit.toFixed(2)}`, 450, position);
  
  position += 15;
  
  // Gross profit margin
  doc.font('Helvetica').text(`Gross Profit Margin: ${summary.grossProfitMargin.toFixed(2)}%`, 50, position);
  
  position += 35;
  
  // Expenses section
  doc.font('Helvetica-Bold').text('Expenses', 50, position);
  
  position += 20;
  
  // List expense categories
  reportData.expensesByCategory.forEach(category => {
    doc.font('Helvetica').text(category.category, 70, position);
    doc.text(`₹${category.amount.toFixed(2)}`, 450, position);
    
    position += 20;
  });
  
  // Total expenses
  doc.font('Helvetica-Bold').text('Total Expenses', 50, position);
  doc.text(`₹${summary.totalExpenses.toFixed(2)}`, 450, position);
  
  position += 25;
  
  // Draw line before net profit
  doc.moveTo(50, position)
     .lineTo(550, position)
     .stroke();
  
  position += 15;
  
  // Net profit
  doc.font('Helvetica-Bold').text('Net Profit', 50, position);
  doc.text(`₹${summary.netProfit.toFixed(2)}`, 450, position);
  
  position += 15;
  
  // Net profit margin
  doc.font('Helvetica').text(`Net Profit Margin: ${summary.netProfitMargin.toFixed(2)}%`, 50, position);
  
  // Visualization suggestion
  position += 50;
  doc.fontSize(10).text('Note: For detailed charts and visualizations, please view the report in the application.', { align: 'center', italic: true });
};

// Helper function to render inventory report
const renderInventoryReport = (doc, reportData) => {
  // Add summary section
  doc.fontSize(14).text('Inventory Summary', { underline: true });
  doc.moveDown();
  
  const { summary } = reportData;
  
  doc.fontSize(10);
  doc.text(`Total Products: ${summary.totalProducts}`);
  doc.text(`Total Inventory Value: ₹${summary.totalInventoryValue.toFixed(2)}`);
  doc.text(`Potential Revenue: ₹${summary.potentialRevenue.toFixed(2)}`);
  doc.text(`Potential Profit: ₹${summary.potentialProfit.toFixed(2)}`);
  doc.text(`Potential Profit Margin: ${summary.potentialProfitMargin.toFixed(2)}%`);
  doc.moveDown(2);
  
  // Add inventory by category section
  doc.fontSize(14).text('Inventory by Category', { underline: true });
  doc.moveDown();
  
  // Create table for categories
  const tableTop = doc.y;
  doc.fontSize(10);
  
  // Headers
  doc.text('Category', 50, tableTop);
  doc.text('Items', 280, tableTop);
  doc.text('Value', 450, tableTop);
  
  // Draw line under headers
  doc.moveTo(50, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();
  
  let tablePosition = tableTop + 25;
  
  // Add each category
  Object.entries(reportData.productsByCategory).forEach(([category, data]) => {
    doc.text(category, 50, tablePosition);
    doc.text(data.count.toString(), 280, tablePosition);
    doc.text(`₹${data.value.toFixed(2)}`, 450, tablePosition);
    
    tablePosition += 20;
  });
  
  doc.moveDown(3);
  
  // Add low stock products section
  if (reportData.lowStockProducts && reportData.lowStockProducts.length > 0) {
    doc.addPage(); // Start on a new page
    
    doc.fontSize(14).text('Low Stock Products', { underline: true });
    doc.moveDown();
    
    // Create table for low stock
    const lowStockTableTop = doc.y;
    doc.fontSize(10);
    
    // Headers
    doc.text('Product', 50, lowStockTableTop);
    doc.text('SKU', 250, lowStockTableTop);
    doc.text('Quantity', 350, lowStockTableTop);
    doc.text('Reorder Level', 450, lowStockTableTop);
    
    // Draw line
    doc.moveTo(50, lowStockTableTop + 15)
       .lineTo(550, lowStockTableTop + 15)
       .stroke();
    
    let lowStockTablePosition = lowStockTableTop + 25;
    
    // List low stock products
    reportData.lowStockProducts.forEach(product => {
      doc.text(product.name, 50, lowStockTablePosition);
      doc.text(product.sku || '', 250, lowStockTablePosition);
      doc.text(product.quantity.toString(), 350, lowStockTablePosition);
      doc.text(product.reorderLevel.toString(), 450, lowStockTablePosition);
      
      lowStockTablePosition += 20;
    });
  }
};

module.exports = {
  generateInvoicePdf,
  generateReportPdf
};
