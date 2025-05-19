import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Inventory',
      icon: 'inventory_2',
      route: '/inventory',
      children: [
        { label: 'All Products', icon: 'list', route: '/inventory/products' },
        { label: 'Add Product', icon: 'add_circle', route: '/inventory/products/new' },
        { label: 'Low Stock', icon: 'warning', route: '/inventory/low-stock' }
      ]
    },
    {
      label: 'Invoices',
      icon: 'receipt',
      route: '/invoices',
      children: [
        { label: 'All Invoices', icon: 'list', route: '/invoices/list' },
        { label: 'Create Invoice', icon: 'add_circle', route: '/invoices/new' }
      ]
    },
    {
      label: 'Expenses',
      icon: 'payments',
      route: '/expenses',
      children: [
        { label: 'All Expenses', icon: 'list', route: '/expenses/list' },
        { label: 'Add Expense', icon: 'add_circle', route: '/expenses/new' }
      ]
    },
    {
      label: 'Reports',
      icon: 'bar_chart',
      route: '/reports',
      children: [
        { label: 'Sales Report', icon: 'assessment', route: '/reports/sales' },
        { label: 'Profit & Loss', icon: 'trending_up', route: '/reports/profit-loss' },
        { label: 'Inventory Report', icon: 'inventory', route: '/reports/inventory' }
      ]
    }
  ];

  expandedMenuItems: { [key: string]: boolean } = {};

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Initialize all menu items as collapsed
    this.menuItems.forEach(item => {
      if (item.children) {
        this.expandedMenuItems[item.label] = false;
      }
    });
  }

  toggleMenuItem(label: string): void {
    this.expandedMenuItems[label] = !this.expandedMenuItems[label];
  }

  isMenuItemExpanded(label: string): boolean {
    return this.expandedMenuItems[label] || false;
  }
}
