export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface Invoice {
  id?: number;
  invoiceNumber?: string;
  customerId?: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceFilter {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: string;
}
