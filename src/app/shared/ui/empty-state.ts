import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/** Bloque reutilizable para listas vacías o estados sin datos. */
@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty">
      <span class="empty__icon"><mat-icon [svgIcon]="icon()" /></span>
      <h3>{{ title() }}</h3>
      @if (message()) {
        <p>{{ message() }}</p>
      }
      @if (actionLabel()) {
        <button matButton="outlined" type="button" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 48px 24px;
      text-align: center;
    }

    .empty__icon {
      display: grid;
      place-items: center;
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: var(--mat-sys-surface-container-high, #eceef5);
      color: var(--mat-sys-on-surface-variant, #44474e);
    }

    h3 {
      margin: 0;
      font-size: 1.02rem;
      font-weight: 650;
    }

    p {
      margin: 0;
      max-width: 420px;
      font-size: 0.88rem;
      color: var(--mat-sys-on-surface-variant, #44474e);
    }
  `,
})
export class EmptyState {
  readonly icon = input('info');
  readonly title = input.required<string>();
  readonly message = input('');
  readonly actionLabel = input<string>();
  readonly action = output<void>();
}
