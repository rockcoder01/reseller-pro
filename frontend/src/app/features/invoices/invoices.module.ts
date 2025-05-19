import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';

// Import NgxPrintModule for PDF/printing support
import { NgxPrintModule } from 'ngx-print';

const routes: Routes = [
  { path: 'list', component: InvoiceListComponent },
  { path: 'new', component: InvoiceFormComponent },
  { path: ':id', component: InvoiceFormComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    InvoiceListComponent,
    InvoiceFormComponent
  ],
  imports: [
    SharedModule,
    NgxPrintModule,
    RouterModule.forChild(routes)
  ]
})
export class InvoicesModule { }
