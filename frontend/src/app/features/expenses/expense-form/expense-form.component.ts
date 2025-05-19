import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense, ExpenseCategory } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  expenseId: number | null = null;
  
  expenseCategories: ExpenseCategory[] = [];
  isAddingNewCategory = false;
  newCategoryName = '';
  
  recurringFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.expenseForm = this.createExpenseForm();
  }

  ngOnInit(): void {
    this.loadExpenseCategories();
    
    // Check if we're in edit mode
    const expenseId = this.route.snapshot.paramMap.get('id');
    if (expenseId && expenseId !== 'new') {
      this.isEditMode = true;
      this.expenseId = +expenseId;
      this.loadExpense(this.expenseId);
    }
    
    // Listen for recurring changes
    this.expenseForm.get('isRecurring')?.valueChanges.subscribe(isRecurring => {
      const recurringFrequencyControl = this.expenseForm.get('recurringFrequency');
      
      if (isRecurring) {
        recurringFrequencyControl?.setValidators([Validators.required]);
      } else {
        recurringFrequencyControl?.clearValidators();
        recurringFrequencyControl?.setValue(null);
      }
      
      recurringFrequencyControl?.updateValueAndValidity();
    });
  }
  
  createExpenseForm(): FormGroup {
    return this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      date: [new Date(), Validators.required],
      isRecurring: [false],
      recurringFrequency: [null],
      notes: ['']
    });
  }
  
  loadExpenseCategories(): void {
    this.expenseService.getExpenseCategories()
      .subscribe({
        next: (categories) => {
          this.expenseCategories = categories;
        },
        error: (error) => {
          console.error('Error loading expense categories:', error);
          this.snackBar.open('Failed to load expense categories. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  loadExpense(id: number): void {
    this.isLoading = true;
    this.expenseService.getExpense(id)
      .subscribe({
        next: (expense) => {
          // Handle the date conversion
          if (expense.date) {
            expense.date = new Date(expense.date);
          }
          
          this.expenseForm.patchValue(expense);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading expense:', error);
          this.snackBar.open('Failed to load expense details. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
          this.router.navigate(['/expenses/list']);
        }
      });
  }
  
  onSubmit(): void {
    if (this.expenseForm.invalid) {
      return;
    }
    
    const expenseData: Expense = this.expenseForm.value;
    this.isLoading = true;
    
    if (this.isEditMode && this.expenseId) {
      // Update existing expense
      this.expenseService.updateExpense(this.expenseId, expenseData)
        .subscribe({
          next: () => {
            this.snackBar.open('Expense updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.isLoading = false;
            this.router.navigate(['/expenses/list']);
          },
          error: (error) => {
            console.error('Error updating expense:', error);
            this.snackBar.open('Failed to update expense. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        });
    } else {
      // Create new expense
      this.expenseService.createExpense(expenseData)
        .subscribe({
          next: () => {
            this.snackBar.open('Expense created successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.isLoading = false;
            this.router.navigate(['/expenses/list']);
          },
          error: (error) => {
            console.error('Error creating expense:', error);
            this.snackBar.open('Failed to create expense. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        });
    }
  }
  
  showAddCategoryForm(): void {
    this.isAddingNewCategory = true;
    this.newCategoryName = '';
  }
  
  cancelAddCategory(): void {
    this.isAddingNewCategory = false;
    this.newCategoryName = '';
  }
  
  addNewCategory(): void {
    if (!this.newCategoryName.trim()) {
      return;
    }
    
    const newCategory: ExpenseCategory = {
      name: this.newCategoryName.trim(),
      description: ''
    };
    
    this.expenseService.createExpenseCategory(newCategory)
      .subscribe({
        next: (category) => {
          this.expenseCategories.push(category);
          this.expenseForm.get('category')?.setValue(category.name);
          this.isAddingNewCategory = false;
          this.newCategoryName = '';
          
          this.snackBar.open('Category created successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.snackBar.open('Failed to create category. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  onCancel(): void {
    this.router.navigate(['/expenses/list']);
  }
}
