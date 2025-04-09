import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Transaction, TransactionDay, TransactionsResponse } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:8080/api/transactions';

  constructor(private http: HttpClient) {}

  getFlattenedTransactions(): Observable<Transaction[]> {
    return this.http.get<TransactionsResponse>(this.apiUrl).pipe(
      map((response) => {
        const transactions: Transaction[] = [];
        response.days.forEach(day => {
          day.transactions.forEach(tx => {
            // Convert USD to EUR if needed
            let amount = tx.amount;
            if (tx.currencyCode === 'USD' && tx.currencyRate) {
              amount = +(tx.amount * tx.currencyRate).toFixed(2);
            }

            transactions.push({
              ...tx,
              amount,
              currencyCode: 'EUR'
            });
          });
        });

        // Sort by timestamp DESC
        return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      })
    );
  }
}
