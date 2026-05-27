import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ConsolidationService } from '../../services/consolidation.service';
import { DailyBalance, BalanceSummary } from '../../models/balance.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    LoadingComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  filterForm: FormGroup;
  isLoading = false;
  balanceHistory: DailyBalance[] = [];
  summary: BalanceSummary | null = null;
  currentBalance = 0;
  totalCredits = 0;
  totalDebits = 0;

  constructor(
    private fb: FormBuilder,
    private consolidationService: ConsolidationService
  ) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.filterForm = this.fb.group({
      startDate: [thirtyDaysAgo],
      endDate: [today]
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    const startDate = this.formatDate(this.filterForm.value.startDate);
    const endDate = this.formatDate(this.filterForm.value.endDate);

    // Carregar histórico de saldos
    this.consolidationService.getBalanceHistory(startDate, endDate).subscribe({
      next: (history) => {
        this.balanceHistory = history;
        this.calculateMetrics();
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
        this.isLoading = false;
      }
    });

    // Carregar resumo
    this.consolidationService.getSummary(startDate, endDate).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar resumo:', error);
        this.isLoading = false;
      }
    });
  }

  calculateMetrics(): void {
    if (this.balanceHistory.length > 0) {
      const latest = this.balanceHistory[0];
      this.currentBalance = latest.closingBalance;
      
      this.totalCredits = this.balanceHistory.reduce(
        (sum, day) => sum + day.totalCredits, 0
      );
      
      this.totalDebits = this.balanceHistory.reduce(
        (sum, day) => sum + day.totalDebits, 0
      );
    }
  }

  applyFilter(): void {
    this.loadDashboardData();
  }

  setQuickFilter(days: number): void {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    
    this.filterForm.patchValue({
      startDate: startDate,
      endDate: today
    });
    
    this.loadDashboardData();
  }

  formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDateDisplay(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  getBalanceColor(): string {
    return this.currentBalance >= 0 ? 'primary' : 'warn';
  }
}

// Made with Bob
