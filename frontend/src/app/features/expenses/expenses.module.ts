import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';

// Import Chart.js
import { NgChartsModule } from 'ng2-charts';

const routes: Routes = [
  { path: 'list', component: ExpenseListComponent },
  { path: 'new', component: ExpenseFormComponent },
  { path: ':id', component: ExpenseFormComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    ExpenseListComponent,
    ExpenseFormComponent
  ],
  imports: [
    SharedModule,
    NgChartsModule,
    RouterModule.forChild(routes)
  ]
})
export class ExpensesModule { }
