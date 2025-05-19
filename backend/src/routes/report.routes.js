// Since we might not have the authentication middleware fully implemented yet,
// we'll temporarily create routes without auth requirements
const controller = require("../controllers/report.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get sales report
  app.get(
    "/api/reports/sales",
    controller.getSalesReport
  );

  // Get expense report
  app.get(
    "/api/reports/expenses",
    controller.getExpenseReport
  );

  // Get profit/loss report
  app.get(
    "/api/reports/profit-loss",
    controller.getProfitLossReport
  );

  // Get inventory report
  app.get(
    "/api/reports/inventory",
    controller.getInventoryReport
  );

  // Generate PDF report
  app.get(
    "/api/reports/pdf",
    controller.generateReportPdf
  );
};