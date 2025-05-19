import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceFilter } from '../models/invoice.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) { }

  getInvoices(filter?: InvoiceFilter): Observable<Invoice[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
      if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
      if (filter.paymentStatus) params = params.set('paymentStatus', filter.paymentStatus);
    }
    
    return this.http.get<Invoice[]>(this.apiUrl, { params });
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  deleteInvoice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  generatePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  sendInvoiceByEmail(id: number, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/send-email`, { email });
  }

  getRecentInvoices(limit: number = 5): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  getTotalSalesByPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sales-by-period?period=${period}`);
  }
}
