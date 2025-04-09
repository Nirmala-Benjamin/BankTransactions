export interface Transaction {
    id: number;
    timestamp: string;
    amount: number;
    currencyCode: string;
    currencyRate?: number;
    description: string;
    otherParty?: {
      name: string;
      iban: string;
    };
  }
  
  export interface TransactionDay {
    id: string;
    transactions: Transaction[];
  }
  
  export interface TransactionsResponse {
    days: TransactionDay[];
  }
  