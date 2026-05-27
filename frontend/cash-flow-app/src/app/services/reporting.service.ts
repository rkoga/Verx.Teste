import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardData } from '../models/dashboard.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private readonly apiUrl = environment.apiUrls.reporting;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/api/dashboard`);
  }

  getTransactions(filters?: any): Observable<{ data: Transaction[]; pagination: any }> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<{ data: Transaction[]; pagination: any }>(
      `${this.apiUrl}/api/transactions`,
      { params }
    );
  }
}

// Made with Bob
