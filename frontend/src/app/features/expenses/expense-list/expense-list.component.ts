import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense, ExpenseCategory, ExpenseFilter } from '../../../core/models/expense.model';
import { ChartData, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  displayedColumns: string[] = [
    'title', 
    'category', 
    'amount', 
    'date', 
    'isRecurring',
    'actions'
  ];
  
  dataSource = new MatTableDataSource<Expense>([]);
  isLoading = true;
  expenseCategories: ExpenseCategory[] = [];
  
  // Filter form
  filterForm = new FormGroup({
    search: new FormControl(''),
    category: new FormControl(''),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null)
  });
  
  // Chart data
  expenseChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC249', '#EA526F', '#23B5D3'
        ]
      }
    ]
  };
  
  expenseChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };
  
  // View summary
  totalExpenses: number = 0;
  expensesByCategoryData: any[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private expenseService: ExpenseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExpenses();
    this.loadExpenseCategories();
    this.loadExpensesByCategory();
    
    // Setup search debounce
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadExpenses();
      });
      
    // Setup category filter change listener
    this.filterForm.get('category')?.valueChanges.subscribe(() => this.loadExpenses());
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadExpenses() {
    this.isLoading = true;
    
    const filter: ExpenseFilter = {
      search: this.filterForm.get('search')?.value || undefined,
      category: this.filterForm.get('category')?.value || undefined,
      startDate: this.filterForm.get('startDate')?.value || undefined,
      endDate: this.filterForm.get('endDate')?.value || undefined
    };
    
    this.expenseService.getExpenses(filter)
      .subscribe({
        next: (expenses) => {
          this.dataSource.data = expenses;
          this.calculateTotalExpenses(expenses);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading expenses:', error);
          this.snackBar.open('Failed to load expenses. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }
  
  loadExpenseCategories() {
    this.expenseService.getExpenseCategories()
      .subscribe({
        next: (categories) => {
          this.expenseCategories = categories;
        },
        error: (error) => {
          console.error('Error loading expense categories:', error);
        }
      });
  }
  
  loadExpensesByCategory() {
    this.expenseService.getExpensesByCategory()
      .subscribe({
        next: (data) => {
          this.expensesByCategoryData = data;
          this.updateExpenseChart(data);
        },
        error: (error) => {
          console.error('Error loading expenses by category:', error);
        }
      });
  }
  
  updateExpenseChart(data: any[]) {
    this.expenseChartData = {
      labels: data.map(item => item.category),
      datasets: [
        {
          data: data.map(item => item.amount),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8AC249', '#EA526F', '#23B5D3'
          ]
        }
      ]
    };
  }
  
  calculateTotalExpenses(expenses: Expense[]) {
    this.totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  }
  
  applyDateFilter() {
    this.loadExpenses();
  }
  
  clearFilters() {
    this.filterForm.reset({
      search: '',
      category: '',
      startDate: null,
      endDate: null
    });
    this.loadExpenses();
  }
  
  editExpense(expense: Expense) {
    this.router.navigate(['/expenses', expense.id]);
  }
  
  deleteExpense(expense: Expense) {
    if (confirm(`Are you sure you want to delete expense "${expense.title}"?`)) {
      this.expenseService.deleteExpense(expense.id!)
        .subscribe({
          next: () => {
            this.snackBar.open('Expense deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadExpenses();
            this.loadExpensesByCategory();
          },
          error: (error) => {
            console.error('Error deleting expense:', error);
            this.snackBar.open('Failed to delete expense. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
  
  addExpense() {
    this.router.navigate(['/expenses/new']);
  }
  
  getRecurringBadge(isRecurring: boolean | undefined, frequency?: string): string {
    if (!isRecurring) {
      return 'One-time';
    }
    
    if (frequency) {
      return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
    
    return 'Recurring';
  }
  
  getRecurringClass(isRecurring: boolean | undefined): string {
    return isRecurring ? 'recurring' : 'one-time';
  }
}
