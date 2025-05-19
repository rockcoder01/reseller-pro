module.exports = (sequelize, Sequelize) => {
  const Employee = sequelize.define('employee', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: Sequelize.STRING
    },
    position: {
      type: Sequelize.STRING,
      allowNull: false
    },
    salary: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    paymentType: {
      type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
      defaultValue: 'monthly'
    },
    joinDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    notes: {
      type: Sequelize.TEXT
    }
  }, {
    timestamps: true,
    underscored: true
  });

  const EmployeeAttendance = sequelize.define('employee_attendance', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    timeIn: {
      type: Sequelize.TIME
    },
    timeOut: {
      type: Sequelize.TIME
    },
    status: {
      type: Sequelize.ENUM('present', 'absent', 'late', 'half-day'),
      allowNull: false,
      defaultValue: 'present'
    },
    notes: {
      type: Sequelize.TEXT
    }
  }, {
    timestamps: true,
    underscored: true
  });

  const EmployeeSalary = sequelize.define('employee_salary', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    month: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    paymentDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    paymentMethod: {
      type: Sequelize.STRING
    },
    notes: {
      type: Sequelize.TEXT
    }
  }, {
    timestamps: true,
    underscored: true
  });

  Employee.hasMany(EmployeeAttendance, { as: 'attendance', foreignKey: 'employeeId' });
  EmployeeAttendance.belongsTo(Employee, { foreignKey: 'employeeId' });

  Employee.hasMany(EmployeeSalary, { as: 'salaries', foreignKey: 'employeeId' });
  EmployeeSalary.belongsTo(Employee, { foreignKey: 'employeeId' });

  return Employee;
};
