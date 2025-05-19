import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardSummary } from '../../core/services/dashboard.service';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  summaryData: DashboardSummary | null = null;
  
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
  
  // Expenses by Category Chart
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
  
  // Top selling products chart
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
  
  // Time period for charts
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summaryData = data;
        
        // Load sales chart
        this.loadSalesChart();
        
        // Load expense chart
        this.loadExpenseChart();
        
        // Load products chart
        this.updateTopProductsChart(data.topSellingProducts);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }
  
  loadSalesChart(): void {
    this.dashboardService.getSalesByPeriod(this.selectedPeriod).subscribe({
      next: (data) => {
        this.salesChartData = {
          labels: data.map(item => item.label),
          datasets: [
            {
              data: data.map(item => item.sales),
              label: 'Sales',
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
  
  loadExpenseChart(): void {
    this.dashboardService.getExpensesByCategory().subscribe({
      next: (data) => {
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
      },
      error: (error) => {
        console.error('Error loading expense data:', error);
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
  
  onPeriodChange(): void {
    this.loadSalesChart();
  }
}
