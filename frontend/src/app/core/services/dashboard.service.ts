import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  totalSalesToday: number;
  totalSalesMonth: number;
  totalExpensesMonth: number;
  netProfit: number;
  lowStockCount: number;
  pendingInvoicesCount: number;
  totalProducts: number;
  topSellingProducts: any[];
  recentInvoices: any[];
  salesByPeriod: any[];
  expensesByCategory: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`);
  }

  getSalesByPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sales?period=${period}`);
  }

  getExpensesByPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expenses?period=${period}`);
  }

  getTopSellingProducts(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-products?limit=${limit}`);
  }

  getExpensesByCategory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expenses-by-category`);
  }

  getProfitLossByPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/profit-loss?period=${period}`);
  }
}
