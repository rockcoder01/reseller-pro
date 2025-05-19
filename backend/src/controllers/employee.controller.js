const db = require('../models');
const Employee = db.employee;
const EmployeeAttendance = db.employeeAttendance;
const EmployeeSalary = db.employeeSalary;
const Op = db.Sequelize.Op;

// Create a new Employee
exports.create = async (req, res) => {
  try {
    const employee = await Employee.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      salary: req.body.salary,
      paymentType: req.body.paymentType,
      joinDate: req.body.joinDate,
      status: req.body.status,
      notes: req.body.notes
    });
    
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Retrieve all Employees
exports.findAll = async (req, res) => {
  try {
    const { search } = req.query;
    let condition = {};
    
    // Build search condition
    if (search) {
      condition = {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } },
          { position: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    const employees = await Employee.findAll({
      where: condition,
      order: [['firstName', 'ASC']]
    });
    
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Find a single Employee with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const employee = await Employee.findByPk(id);
    
    if (!employee) {
      return res.status(404).json({ message: `Employee with id=${id} not found` });
    }
    
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an Employee by id
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [num, updatedEmployee] = await Employee.update(req.body, {
      where: { id: id },
      returning: true
    });
    
    if (num === 0) {
      return res.status(404).json({ message: `Employee with id=${id} not found` });
    }
    
    res.status(200).json(updatedEmployee[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an Employee with id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await Employee.destroy({
      where: { id: id }
    });
    
    if (num === 0) {
      return res.status(404).json({ message: `Employee with id=${id} not found` });
    }
    
    res.status(200).json({ message: 'Employee was deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance by employee id
exports.getAttendance = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { month, year } = req.query;
    
    let condition = { employeeId };
    
    // Add month and year filter if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      
      condition.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const attendance = await EmployeeAttendance.findAll({
      where: condition,
      order: [['date', 'DESC']]
    });
    
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark attendance for an employee
exports.markAttendance = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    
    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    
    if (!employee) {
      return res.status(404).json({ message: `Employee with id=${employeeId} not found` });
    }
    
    // Check if attendance already exists for the date
    const existingAttendance = await EmployeeAttendance.findOne({
      where: {
        employeeId,
        date: req.body.date
      }
    });
    
    if (existingAttendance) {
      // Update existing attendance
      const updatedAttendance = await existingAttendance.update({
        timeIn: req.body.timeIn,
        timeOut: req.body.timeOut,
        status: req.body.status,
        notes: req.body.notes
      });
      
      return res.status(200).json(updatedAttendance);
    }
    
    // Create new attendance record
    const attendance = await EmployeeAttendance.create({
      employeeId,
      date: req.body.date,
      timeIn: req.body.timeIn,
      timeOut: req.body.timeOut,
      status: req.body.status,
      notes: req.body.notes
    });
    
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get salary history for an employee
exports.getSalaryHistory = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    
    const salaries = await EmployeeSalary.findAll({
      where: { employeeId },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });
    
    res.status(200).json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pay salary to an employee
exports.paySalary = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    
    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    
    if (!employee) {
      return res.status(404).json({ message: `Employee with id=${employeeId} not found` });
    }
    
    // Check if salary already paid for the month/year
    const existingSalary = await EmployeeSalary.findOne({
      where: {
        employeeId,
        month: req.body.month,
        year: req.body.year
      }
    });
    
    if (existingSalary) {
      return res.status(400).json({ message: 'Salary already paid for this month' });
    }
    
    // Create salary record
    const salary = await EmployeeSalary.create({
      employeeId,
      amount: req.body.amount,
      month: req.body.month,
      year: req.body.year,
      paymentDate: req.body.paymentDate || new Date(),
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes
    });
    
    res.status(201).json(salary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
