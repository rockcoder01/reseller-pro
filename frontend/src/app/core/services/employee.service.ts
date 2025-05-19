import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeAttendance, EmployeeSalary } from '../models/employee.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) { }

  getEmployees(search?: string): Observable<Employee[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    
    return this.http.get<Employee[]>(this.apiUrl, { params });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Attendance methods
  getAttendanceByEmployee(employeeId: number, month?: number, year?: number): Observable<EmployeeAttendance[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());
    
    return this.http.get<EmployeeAttendance[]>(`${this.apiUrl}/${employeeId}/attendance`, { params });
  }

  markAttendance(employeeId: number, attendance: EmployeeAttendance): Observable<EmployeeAttendance> {
    return this.http.post<EmployeeAttendance>(`${this.apiUrl}/${employeeId}/attendance`, attendance);
  }

  // Salary methods
  getSalaryHistory(employeeId: number): Observable<EmployeeSalary[]> {
    return this.http.get<EmployeeSalary[]>(`${this.apiUrl}/${employeeId}/salary`);
  }

  paySalary(employeeId: number, salary: EmployeeSalary): Observable<EmployeeSalary> {
    return this.http.post<EmployeeSalary>(`${this.apiUrl}/${employeeId}/salary`, salary);
  }
}
