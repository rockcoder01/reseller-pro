import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ProductService } from '../../../core/services/product.service';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatTableDataSource } from '@angular/material/table';

interface SalesSummary {
  totalSales: number;
  totalItems: number;
  averageOrderValue: number;
  topSellingProducts: any[];
}

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {
  isLoading = true;
  
  // Date range form
  dateRangeForm = new FormGroup({
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
  });
  
  // Sales data
  salesSummary: SalesSummary = {
    totalSales: 0,
    totalItems: 0,
    averageOrderValue: 0,
    topSellingProducts: []
  };
  
  // Time period for charts
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
  
  // Sales Chart
  salesChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  salesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    },
    scales: {
      x: {
        grid: {
          drawOnChartArea: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`
        }
      }
    }
  };
  
  // Top Products Chart
  productsChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Quantity Sold',
        backgroundColor: '#36A2EB'
      }
    ]
  };
  
  productsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      }
    }
  };
  
  // Sales by product table
  displayedProductColumns: string[] = ['name', 'quantitySold', 'revenue', 'percentage'];
  productDataSource = new MatTableDataSource<any>([]);

  constructor(
    private invoiceService: InvoiceService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.dateRangeForm.setValue({
      startDate: thirtyDaysAgo,
      endDate: today
    });
    
    this.loadSalesData();
  }
  
  loadSalesData(): void {
    this.isLoading = true;
    
    // Load sales chart data
    this.loadSalesChart();
    
    // Get top selling products
    this.productService.getLowStockProducts().subscribe({
      next: (products) => {
        // Simulate top products data as this would normally come from an API endpoint
        const topProducts = products.slice(0, 5).map(p => ({
          name: p.name,
          quantitySold: Math.floor(Math.random() * 50) + 10,
          revenue: (Math.floor(Math.random() * 50) + 10) * p.sellingPrice
        }));
        
        this.salesSummary.topSellingProducts = topProducts;
        this.updateTopProductsChart(topProducts);
        this.updateProductsTable(topProducts);
        
        // Calculate totals
        this.salesSummary.totalItems = topProducts.reduce((sum, p) => sum + p.quantitySold, 0);
        this.salesSummary.totalSales = topProducts.reduce((sum, p) => sum + p.revenue, 0);
        this.salesSummary.averageOrderValue = this.salesSummary.totalSales / (topProducts.length || 1);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products data:', error);
        this.isLoading = false;
      }
    });
  }
  
  loadSalesChart(): void {
    this.invoiceService.getTotalSalesByPeriod(this.selectedPeriod).subscribe({
      next: (data) => {
        this.salesChartData = {
          labels: data.map(item => item.label),
          datasets: [
            {
              data: data.map(item => item.sales),
              label: 'Sales Revenue',
              fill: false,
              tension: 0.2,
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.2)'
            }
          ]
        };
      },
      error: (error) => {
        console.error('Error loading sales data:', error);
      }
    });
  }
  
  updateTopProductsChart(products: any[]): void {
    if (!products || products.length === 0) return;
    
    this.productsChartData = {
      labels: products.map(p => p.name),
      datasets: [
        {
          data: products.map(p => p.quantitySold),
          label: 'Quantity Sold',
          backgroundColor: '#36A2EB'
        }
      ]
    };
  }
  
  updateProductsTable(products: any[]): void {
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    
    const productsWithPercentage = products.map(p => ({
      ...p,
      percentage: totalRevenue ? (p.revenue / totalRevenue * 100).toFixed(1) : 0
    }));
    
    this.productDataSource.data = productsWithPercentage;
  }
  
  onPeriodChange(): void {
    this.loadSalesChart();
  }
  
  applyDateFilter(): void {
    this.loadSalesData();
  }
}
