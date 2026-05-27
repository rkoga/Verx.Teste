import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LoadingComponent } from '../../components/loading/loading.component';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, CreateTransactionDto } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatPaginatorModule,
    LoadingComponent
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactionForm: FormGroup;
  filterForm: FormGroup;
  transactions: Transaction[] = [];
  displayedColumns: string[] = ['date', 'description', 'type', 'amount', 'status'];
  isLoading = false;
  isSaving = false;
  
  // Paginação
  totalTransactions = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private snackBar: MatSnackBar
  ) {
    this.transactionForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['CREDIT', Validators.required],
      date: [new Date(), Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: ['']
    });

    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      type: ['']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    const filters = {
      ...this.filterForm.value,
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    // Converter datas para string ISO
    if (filters.startDate) {
      filters.startDate = this.formatDate(filters.startDate);
    }
    if (filters.endDate) {
      filters.endDate = this.formatDate(filters.endDate);
    }

    this.transactionService.listTransactions(filters).subscribe({
      next: (response) => {
        this.transactions = response.data;
        this.totalTransactions = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar transações:', error);
        this.showMessage('Erro ao carregar transações', 'error');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.isSaving = true;
      const formValue = this.transactionForm.value;
      
      const dto: CreateTransactionDto = {
        idempotencyKey: this.transactionService.generateIdempotencyKey(),
        amount: parseFloat(formValue.amount),
        type: formValue.type,
        date: this.formatDate(formValue.date),
        description: formValue.description,
        categoryId: formValue.categoryId || undefined
      };

      this.transactionService.createTransaction(dto).subscribe({
        next: (transaction) => {
          this.showMessage('Transação criada com sucesso!', 'success');
          this.transactionForm.reset({
            type: 'CREDIT',
            date: new Date()
          });
          this.isSaving = false;
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Erro ao criar transação:', error);
          this.showMessage('Erro ao criar transação', 'error');
          this.isSaving = false;
        }
      });
    }
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.pageIndex = 0;
    this.loadTransactions();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
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

  getTypeColor(type: string): string {
    return type === 'CREDIT' ? 'primary' : 'warn';
  }

  getTypeLabel(type: string): string {
    return type === 'CREDIT' ? 'Crédito' : 'Débito';
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}

// Made with Bob
