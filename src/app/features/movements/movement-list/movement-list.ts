import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';

import { MovementService } from '../../../core/services/movement.service';
import { NotificationService } from '../../../core/services/notification.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { Movement, MovementType, MOVEMENT_LABELS } from '../../../core/models/inventory.models';
import { EmptyState } from '../../../shared/ui/empty-state';
import { MovementFormDialog } from '../movement-form-dialog/movement-form-dialog';

type TypeFilter = 'all' | MovementType;

@Component({
  selector: 'app-movement-list',
  imports: [
    DatePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    EmptyState,
  ],
  templateUrl: './movement-list.html',
  styleUrl: './movement-list.scss',
})
export class MovementList {
  private readonly movementService = inject(MovementService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  protected readonly labels = MOVEMENT_LABELS;
  protected readonly columns = ['createdAt', 'type', 'product', 'quantity', 'note'];
  protected readonly movements = signal<Movement[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly typeFilter = signal<TypeFilter>('all');
  protected readonly limit = signal(50);

  protected readonly filtered = computed(() => {
    const filter = this.typeFilter();
    const list = this.movements();
    return filter === 'all' ? list : list.filter((movement) => movement.type === filter);
  });

  protected readonly counts = computed(() => {
    const list = this.movements();
    return {
      entries: list.filter((movement) => movement.type === 'Entry').length,
      exits: list.filter((movement) => movement.type === 'Exit').length,
    };
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.movementService
      .list(this.limit())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (movements) => this.movements.set(movements),
        error: (error: unknown) =>
          this.error.set(apiErrorMessage(error, 'No se pudieron cargar los movimientos.')),
      });
  }

  protected changeLimit(value: number): void {
    this.limit.set(value);
    this.load();
  }

  protected labelOf(movement: Movement): string {
    return this.labels[movement.type];
  }

  protected create(): void {
    this.dialog
      .open<MovementFormDialog, undefined, Movement>(MovementFormDialog, {
        width: '520px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      })
      .afterClosed()
      .subscribe((movement) => {
        if (!movement) {
          return;
        }
        this.notifications.success(
          `${this.labels[movement.type]} de ${movement.quantity} un. registrada para ${movement.productName}.`,
        );
        this.load();
      });
  }
}
