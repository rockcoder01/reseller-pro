import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductFilter } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = [
    'name', 
    'sku', 
    'category', 
    'purchasePrice', 
    'sellingPrice', 
    'quantity', 
    'actions'
  ];
  
  dataSource = new MatTableDataSource<Product>([]);
  isLoading = true;
  
  // Filters
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  supplierControl = new FormControl('');
  brandControl = new FormControl('');
  
  lowStockMode = false;
  
  // Filter options
  categories: string[] = [];
  suppliers: string[] = [];
  brands: string[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Check if we're in low stock mode
    this.route.data.subscribe(data => {
      this.lowStockMode = !!data['lowStock'];
      
      if (this.lowStockMode) {
        this.loadLowStockProducts();
      } else {
        this.loadProducts();
      }
    });
    
    // Load filter options
    this.loadFilterOptions();
    
    // Setup search debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadProducts();
      });
      
    // Setup filter change listeners
    this.categoryControl.valueChanges.subscribe(() => this.loadProducts());
    this.supplierControl.valueChanges.subscribe(() => this.loadProducts());
    this.brandControl.valueChanges.subscribe(() => this.loadProducts());
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProducts() {
    this.isLoading = true;
    
    const filter: ProductFilter = {
      search: this.searchControl.value || undefined,
      category: this.categoryControl.value || undefined,
      supplier: this.supplierControl.value || undefined,
      brand: this.brandControl.value || undefined,
      lowStock: this.lowStockMode
    };
    
    this.productService.getProducts(filter)
      .subscribe({
        next: (products) => {
          this.dataSource.data = products;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.snackBar.open('Failed to load products. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }
  
  loadLowStockProducts() {
    this.isLoading = true;
    this.productService.getLowStockProducts()
      .subscribe({
        next: (products) => {
          this.dataSource.data = products;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading low stock products:', error);
          this.snackBar.open('Failed to load low stock products. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }
  
  loadFilterOptions() {
    this.productService.getCategories().subscribe(categories => this.categories = categories);
    this.productService.getSuppliers().subscribe(suppliers => this.suppliers = suppliers);
    this.productService.getBrands().subscribe(brands => this.brands = brands);
  }
  
  clearFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.supplierControl.setValue('');
    this.brandControl.setValue('');
  }
  
  editProduct(product: Product) {
    this.router.navigate(['/inventory/products', product.id]);
  }
  
  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.productService.deleteProduct(product.id!)
        .subscribe({
          next: () => {
            this.snackBar.open('Product deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.snackBar.open('Failed to delete product. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
  
  addProduct() {
    this.router.navigate(['/inventory/products/new']);
  }
  
  getStockStatus(quantity: number, reorderLevel?: number): string {
    if (!reorderLevel) reorderLevel = 5; // Default reorder level
    
    if (quantity <= 0) {
      return 'out-of-stock';
    } else if (quantity <= reorderLevel) {
      return 'low-stock';
    } else {
      return 'in-stock';
    }
  }
}
