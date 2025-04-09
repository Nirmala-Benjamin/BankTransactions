import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { Transaction } from '../models/transaction.model';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent implements OnInit {
  transaction: Transaction | undefined;

  constructor(private route: ActivatedRoute, private service: TransactionService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service.getFlattenedTransactions().subscribe((data: Transaction[]) => {
      this.transaction = data.find((tx: Transaction) => tx.id === id);
    });
  }
  get convertedAmount(): number {
    if (!this.transaction) return 0;
    return this.transaction.currencyCode === 'USD'
      ? this.transaction.amount * (this.transaction.currencyRate ?? 1)
      : this.transaction.amount;
  }
  
  isCredit(): boolean {
    return this.convertedAmount > 0;
  }
}
