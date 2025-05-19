import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ProductService } from '../../../core/services/product.service';
import { Invoice, InvoiceItem } from '../../../core/models/invoice.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isEditMode = false;
  isLoading = false;
  invoiceId: number | null = null;
  
  paymentStatusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partially Paid' },
    { value: 'unpaid', label: 'Unpaid' }
  ];
  
  paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.invoiceForm = this.createInvoiceForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    
    // Check if we're in edit mode
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId && invoiceId !== 'new') {
      this.isEditMode = true;
      this.invoiceId = +invoiceId;
      this.loadInvoice(this.invoiceId);
    } else {
      // Generate an invoice number for new invoices
      this.generateInvoiceNumber();
    }
  }
  
  createInvoiceForm(): FormGroup {
    return this.formBuilder.group({
      invoiceNumber: ['', Validators.required],
      customerName: ['', Validators.required],
      customerEmail: ['', Validators.email],
      customerPhone: [''],
      customerAddress: [''],
      items: this.formBuilder.array([this.createItemForm()]),
      subtotal: [0, Validators.min(0)],
      taxAmount: [0, Validators.min(0)],
      discountAmount: [0, Validators.min(0)],
      total: [0, [Validators.required, Validators.min(0)]],
      paymentStatus: ['unpaid', Validators.required],
      paymentMethod: [''],
      notes: ['']
    });
  }
  
  createItemForm(): FormGroup {
    return this.formBuilder.group({
      productId: ['', Validators.required],
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discount: [0, Validators.min(0)],
      tax: [0, Validators.min(0)],
      total: [0, [Validators.required, Validators.min(0)]]
    });
  }
  
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }
  
  loadProducts(): void {
    this.productService.getProducts()
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = [...products];
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.snackBar.open('Failed to load products. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  
  loadInvoice(id: number): void {
    this.isLoading = true;
    this.invoiceService.getInvoice(id)
      .subscribe({
        next: (invoice) => {
          // Clear default item
          while (this.items.length) {
            this.items.removeAt(0);
          }
          
          // Add invoice items
          invoice.items.forEach(item => {
            this.items.push(this.formBuilder.group({
              productId: [item.productId, Validators.required],
              productName: [item.productName, Validators.required],
              quantity: [item.quantity, [Validators.required, Validators.min(1)]],
              unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
              discount: [item.discount || 0, Validators.min(0)],
              tax: [item.tax || 0, Validators.min(0)],
              total: [item.total, [Validators.required, Validators.min(0)]]
            }));
          });
          
          // Set the rest of the form values
          this.invoiceForm.patchValue({
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            customerEmail: invoice.customerEmail,
            customerPhone: invoice.customerPhone,
            customerAddress: invoice.customerAddress,
            subtotal: invoice.subtotal,
            taxAmount: invoice.taxAmount || 0,
            discountAmount: invoice.discountAmount || 0,
            total: invoice.total,
            paymentStatus: invoice.paymentStatus || 'unpaid',
            paymentMethod: invoice.paymentMethod || '',
            notes: invoice.notes || ''
          });
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading invoice:', error);
          this.snackBar.open('Failed to load invoice details. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
          this.router.navigate(['/invoices/list']);
        }
      });
  }
  
  generateInvoiceNumber(): void {
    // Generate a simple invoice number based on date and random number
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `INV-${year}${month}-${random}`;
    this.invoiceForm.get('invoiceNumber')?.setValue(invoiceNumber);
  }
  
  addItem(): void {
    this.items.push(this.createItemForm());
  }
  
  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calculateInvoiceTotal();
    }
  }
  
  onProductChange(index: number): void {
    const productId = this.items.at(index).get('productId')?.value;
    if (productId) {
      const product = this.products.find(p => p.id === +productId);
      if (product) {
        this.items.at(index).patchValue({
          productName: product.name,
          unitPrice: product.sellingPrice,
          quantity: 1,
          discount: 0,
          tax: 0
        });
        this.calculateItemTotal(index);
      }
    }
  }
  
  calculateItemTotal(index: number): void {
    const itemGroup = this.items.at(index);
    const quantity = +itemGroup.get('quantity')?.value || 0;
    const unitPrice = +itemGroup.get('unitPrice')?.value || 0;
    const discount = +itemGroup.get('discount')?.value || 0;
    const tax = +itemGroup.get('tax')?.value || 0;
    
    // Calculate the total for this item
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    const total = subtotal - discountAmount + taxAmount;
    
    itemGroup.get('total')?.setValue(parseFloat(total.toFixed(2)));
    
    // Recalculate the invoice total
    this.calculateInvoiceTotal();
  }
  
  calculateInvoiceTotal(): void {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    
    // Sum up all the item totals
    for (let i = 0; i < this.items.length; i++) {
      const itemGroup = this.items.at(i);
      const quantity = +itemGroup.get('quantity')?.value || 0;
      const unitPrice = +itemGroup.get('unitPrice')?.value || 0;
      const discount = +itemGroup.get('discount')?.value || 0;
      const tax = +itemGroup.get('tax')?.value || 0;
      
      const itemSubtotal = quantity * unitPrice;
      const itemDiscountAmount = (itemSubtotal * discount) / 100;
      const itemTaxAmount = ((itemSubtotal - itemDiscountAmount) * tax) / 100;
      
      subtotal += itemSubtotal;
      discountAmount += itemDiscountAmount;
      taxAmount += itemTaxAmount;
    }
    
    const total = subtotal - discountAmount + taxAmount;
    
    // Update the invoice form
    this.invoiceForm.patchValue({
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  }
  
  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    const invoiceData: Invoice = this.invoiceForm.value;
    this.isLoading = true;
    
    if (this.isEditMode && this.invoiceId) {
      // Update existing invoice
      this.invoiceService.updateInvoice(this.invoiceId, invoiceData)
        .subscribe({
          next: () => {
            this.snackBar.open('Invoice updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.isLoading = false;
            this.router.navigate(['/invoices/list']);
          },
          error: (error) => {
            console.error('Error updating invoice:', error);
            this.snackBar.open('Failed to update invoice. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        });
    } else {
      // Create new invoice
      this.invoiceService.createInvoice(invoiceData)
        .subscribe({
          next: () => {
            this.snackBar.open('Invoice created successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.isLoading = false;
            this.router.navigate(['/invoices/list']);
          },
          error: (error) => {
            console.error('Error creating invoice:', error);
            this.snackBar.open('Failed to create invoice. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        });
    }
  }
  
  downloadPdf(): void {
    if (this.isEditMode && this.invoiceId) {
      this.invoiceService.generatePdf(this.invoiceId)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${this.invoiceForm.get('invoiceNumber')?.value}.pdf`;
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
    } else {
      this.snackBar.open('Save the invoice first before downloading PDF', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }
  
  sendInvoiceByEmail(): void {
    if (this.isEditMode && this.invoiceId) {
      const email = this.invoiceForm.get('customerEmail')?.value;
      
      if (!email) {
        this.snackBar.open('Customer email is required to send invoice', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        return;
      }
      
      this.invoiceService.sendInvoiceByEmail(this.invoiceId, email)
        .subscribe({
          next: () => {
            this.snackBar.open('Invoice sent by email successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('Error sending invoice by email:', error);
            this.snackBar.open('Failed to send invoice by email. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      this.snackBar.open('Save the invoice first before sending by email', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }
  
  onCancel(): void {
    this.router.navigate(['/invoices/list']);
  }
  
  filterProducts(query: string): void {
    if (query) {
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) || 
        (product.sku && product.sku.toLowerCase().includes(query.toLowerCase())) ||
        (product.barcode && product.barcode.toLowerCase().includes(query.toLowerCase()))
      );
    } else {
      this.filteredProducts = [...this.products];
    }
  }
}
