import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Transaction,
  CreateTransactionDto,
  CancelTransactionDto,
  PaginatedTransactions,
  TransactionFilters
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly apiUrl = `${environment.apiUrls.transactions}/transactions`;

  constructor(private http: HttpClient) {}

  createTransaction(dto: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, dto);
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  listTransactions(filters?: TransactionFilters): Observable<PaginatedTransactions> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedTransactions>(this.apiUrl, { params });
  }

  cancelTransaction(id: string, dto: CancelTransactionDto): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}/cancel`, dto);
  }

  generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Made with Bob
