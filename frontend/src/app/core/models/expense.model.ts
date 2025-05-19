export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  date: Date;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  receiptImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExpenseCategory {
  id?: number;
  name: string;
  description?: string;
}

export interface ExpenseFilter {
  search?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}
