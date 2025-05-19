import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice, InvoiceFilter } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  displayedColumns: string[] = [
    'invoiceNumber', 
    'date', 
    'customerName', 
    'total', 
    'paymentStatus', 
    'actions'
  ];
  
  dataSource = new MatTableDataSource<Invoice>([]);
  isLoading = true;
  
  // Date filter form
  filterForm = new FormGroup({
    search: new FormControl(''),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
    paymentStatus: new FormControl('')
  });
  
  paymentStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partially Paid' },
    { value: 'unpaid', label: 'Unpaid' }
  ];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private invoiceService: InvoiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
    
    // Setup search debounce
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadInvoices();
      });
      
    // Setup other filter change listeners
    this.filterForm.get('paymentStatus')?.valueChanges.subscribe(() => this.loadInvoices());
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadInvoices() {
    this.isLoading = true;
    
    const filter: InvoiceFilter = {
      search: this.filterForm.get('search')?.value || undefined,
      startDate: this.filterForm.get('startDate')?.value || undefined,
      endDate: this.filterForm.get('endDate')?.value || undefined,
      paymentStatus: this.filterForm.get('paymentStatus')?.value || undefined
    };
    
    this.invoiceService.getInvoices(filter)
      .subscribe({
        next: (invoices) => {
          this.dataSource.data = invoices;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading invoices:', error);
          this.snackBar.open('Failed to load invoices. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }
  
  applyDateFilter() {
    this.loadInvoices();
  }
  
  clearFilters() {
    this.filterForm.reset({
      search: '',
      startDate: null,
      endDate: null,
      paymentStatus: ''
    });
    this.loadInvoices();
  }
  
  viewInvoice(invoice: Invoice) {
    this.router.navigate(['/invoices', invoice.id]);
  }
  
  editInvoice(invoice: Invoice) {
    this.router.navigate(['/invoices', invoice.id]);
  }
  
  deleteInvoice(invoice: Invoice) {
    if (confirm(`Are you sure you want to delete invoice #${invoice.invoiceNumber}?`)) {
      this.invoiceService.deleteInvoice(invoice.id!)
        .subscribe({
          next: () => {
            this.snackBar.open('Invoice deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadInvoices();
          },
          error: (error) => {
            console.error('Error deleting invoice:', error);
            this.snackBar.open('Failed to delete invoice. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
  
  downloadPdf(invoice: Invoice, event: Event) {
    event.stopPropagation();
    
    this.invoiceService.generatePdf(invoice.id!)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error generating PDF:', error);
          this.snackBar.open('Failed to generate PDF. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  createInvoice() {
    this.router.navigate(['/invoices/new']);
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'partial': return 'status-partial';
      case 'unpaid': return 'status-unpaid';
      default: return '';
    }
  }
}
