import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../services/transaction.service';
import { Transaction } from '../models/transaction.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactionsByDate: [string, Transaction[]][] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';

  constructor(private transactionService: TransactionService, private router: Router) {}

  ngOnInit(): void {
    this.transactionService.getFlattenedTransactions().subscribe(
      transactions => {
        const grouped = this.groupByDate(transactions);
        this.transactionsByDate = grouped;
        this.isLoading = false;
      },
      error => {
        this.errorMessage = 'Failed to load transactions. Please try again.';
        this.isLoading = false;
      }
    );
  }

  groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
    const grouped: Record<string, Transaction[]> = {};
    for (const tx of transactions) {
      const date = new Date(tx.timestamp).toLocaleDateString();
      grouped[date] = grouped[date] || [];
      grouped[date].push(tx);
    }

    return Object.entries(grouped).sort((a, b) =>
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }

  get filteredTransactions(): [string, Transaction[]][] {
    if (!this.searchTerm.trim()) return this.transactionsByDate;
  
    const term = this.searchTerm.toLowerCase();
  
    return this.transactionsByDate
      .map(([date, txs]) => [
        date,
        txs.filter(tx => {
          // Use 'cash' if there is no other party name
          const name = tx.otherParty?.name?.toLowerCase() || 'cash';
          return name.includes(term);
        })
      ] as [string, Transaction[]])
      .filter(([_, txs]) => txs.length > 0);
  }
  
  goToDetail(tx: Transaction) {
    this.router.navigate(['/detail', tx.id], {
      state: { transaction: tx }
    });
  }
}
