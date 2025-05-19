export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string;
  salary: number;
  paymentType: 'daily' | 'weekly' | 'monthly';
  joinDate: Date;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeAttendance {
  id?: number;
  employeeId: number;
  date: Date;
  timeIn?: string;
  timeOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

export interface EmployeeSalary {
  id?: number;
  employeeId: number;
  amount: number;
  month: number;
  year: number;
  paymentDate: Date;
  paymentMethod?: string;
  notes?: string;
}
