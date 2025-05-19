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

module.exports = {
  generateInvoicePdf
};
