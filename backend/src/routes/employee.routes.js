const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { verifyToken } = require('../middleware/auth.jwt');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create a new employee
router.post('/', employeeController.create);

// Retrieve all employees
router.get('/', employeeController.findAll);

// Retrieve a single employee by id
router.get('/:id', employeeController.findOne);

// Update an employee by id
router.put('/:id', employeeController.update);

// Delete an employee by id
router.delete('/:id', employeeController.delete);

// Get attendance by employee id
router.get('/:employeeId/attendance', employeeController.getAttendance);

// Mark attendance for an employee
router.post('/:employeeId/attendance', employeeController.markAttendance);

// Get salary history for an employee
router.get('/:employeeId/salary', employeeController.getSalaryHistory);

// Pay salary to an employee
router.post('/:employeeId/salary', employeeController.paySalary);

module.exports = router;
