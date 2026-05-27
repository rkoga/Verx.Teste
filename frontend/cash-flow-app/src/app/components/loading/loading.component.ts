import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container" *ngIf="isLoading">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      
      p {
        margin-top: 16px;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  `]
})
export class LoadingComponent {
  @Input() isLoading = false;
  @Input() message = '';
  @Input() diameter = 50;
}

// Made with Bob
