import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { ProfitLossReportComponent } from './profit-loss-report/profit-loss-report.component';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';

// Import Chart.js
import { NgChartsModule } from 'ng2-charts';

const routes: Routes = [
  { path: 'sales', component: SalesReportComponent },
  { path: 'profit-loss', component: ProfitLossReportComponent },
  { path: 'inventory', component: InventoryReportComponent },
  { path: '', redirectTo: 'sales', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    SalesReportComponent,
    ProfitLossReportComponent,
    InventoryReportComponent
  ],
  imports: [
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class ReportsModule { }
