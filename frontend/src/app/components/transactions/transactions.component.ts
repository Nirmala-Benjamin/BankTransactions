import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
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
  convertToEUR(amount: number, currency: string, rate: number = 1): number {
    if (currency === 'USD') {
      return amount * rate; 
    }
    return amount; 
  }
  groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
    const grouped: Record<string, Transaction[]> = {};

    // Group transactions by date (ignoring time)
    for (const tx of transactions) {
      const date = new Date(tx.timestamp);
      const dateString = date.toISOString().split('T')[0]; // 'YYYY-MM-DD' format
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(tx);
    }

    // Convert the grouped object into an array of [string, Transaction[]] tuples
    const groupedArray: [string, Transaction[]][] = Object.entries(grouped)
      .map(([date, txs]) => {
        // Sort transactions by timestamp within each group (newest first)
        const sortedTxs = txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return [date, sortedTxs]; // Return the tuple [date, transactions]
      });

    // Sort the grouped array by the date (newest first)
    groupedArray.sort((a, b) => {
      const dateA = a[0]; // This is the date string 'YYYY-MM-DD'
      const dateB = b[0]; // This is the date string 'YYYY-MM-DD'

      // Compare dates as strings in ISO format, which is lexicographically sortable
      if (dateA > dateB) {
        return -1; // `a` is more recent
      } else if (dateA < dateB) {
        return 1;  // `b` is more recent
      }
      return 0; // Equal dates
    });

    return groupedArray;
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
