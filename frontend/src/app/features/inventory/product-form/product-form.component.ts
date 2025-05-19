import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  productId: number | null = null;
  
  // Filter options
  categories: string[] = [];
  suppliers: string[] = [];
  brands: string[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    this.loadFilterOptions();
    
    // Check if we're in edit mode
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId && productId !== 'new') {
      this.isEditMode = true;
      this.productId = +productId;
      this.loadProduct(this.productId);
    }
  }
  
  createProductForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      sku: [''],
      barcode: [''],
      category: [''],
      supplier: [''],
      brand: [''],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [5, Validators.min(0)],
      expiryDate: [null]
    });
  }
  
  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProduct(id)
      .subscribe({
        next: (product) => {
          this.productForm.patchValue(product);
          
          // Handle date conversion if needed
          if (product.expiryDate) {
            this.productForm.get('expiryDate')?.setValue(new Date(product.expiryDate));
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.snackBar.open('Failed to load product details. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
          this.router.navigate(['/inventory/products']);
        }
      });
  }
  
  loadFilterOptions(): void {
    this.productService.getCategories().subscribe(categories => this.categories = categories);
    this.productService.getSuppliers().subscribe(suppliers => this.suppliers = suppliers);
    this.productService.getBrands().subscribe(brands => this.brands = brands);
  }
  
  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }
    
    const productData: Product = this.productForm.value;
    this.isLoading = true;
    
    if (this.isEditMode && this.productId) {
      // Update existing product
      this.productService.updateProduct(this.productId, productData)
        .subscribe({
          next: () => {
            this.snackBar.open('Product updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.isLoading = false;
            this.router.navigate(['/inventory/products']);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.snackBar.open('Failed to update product. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        });
    } else {
      // Create new product
      this.productService.createProduct(productData)
        .subscribe({
          next: () => {
            this.snackBar.open('Product created successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.isLoading = false;
            this.router.navigate(['/inventory/products']);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.snackBar.open('Failed to create product. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        });
    }
  }
  
  calculateMargin(): number {
    const purchasePrice = this.productForm.get('purchasePrice')?.value || 0;
    const sellingPrice = this.productForm.get('sellingPrice')?.value || 0;
    
    if (purchasePrice <= 0) return 0;
    
    const margin = ((sellingPrice - purchasePrice) / sellingPrice) * 100;
    return Math.round(margin * 100) / 100; // Round to 2 decimal places
  }
  
  onCancel(): void {
    this.router.navigate(['/inventory/products']);
  }
}
