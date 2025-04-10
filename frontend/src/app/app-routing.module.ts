import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';


const routes: Routes = [
  { path: '', component: TransactionsComponent },
  { path: 'detail/:id', component: TransactionDetailComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
