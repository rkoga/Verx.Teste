import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DailyBalance, BalanceSummary } from '../models/balance.model';

@Injectable({
  providedIn: 'root'
})
export class ConsolidationService {
  private readonly apiUrl = `${environment.apiUrls.consolidation}/consolidation`;

  constructor(private http: HttpClient) {}

  getBalance(date: string): Observable<DailyBalance> {
    return this.http.get<DailyBalance>(`${this.apiUrl}/balance/${date}`);
  }

  getBalanceHistory(startDate?: string, endDate?: string): Observable<DailyBalance[]> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<DailyBalance[]>(`${this.apiUrl}/balance`, { params });
  }

  getSummary(startDate?: string, endDate?: string): Observable<BalanceSummary> {
    let params = new HttpParams();
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<BalanceSummary>(`${this.apiUrl}/summary`, { params });
  }
}

// Made with Bob
