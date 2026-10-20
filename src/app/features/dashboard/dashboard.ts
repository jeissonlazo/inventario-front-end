import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { InventoryService } from '../../core/services/inventory.service';
import { MovementService } from '../../core/services/movement.service';
import { Dashboard as DashboardData, Movement, MOVEMENT_LABELS } from '../../core/models/inventory.models';
import { apiErrorMessage } from '../../core/api/api-error';
import { EmptyState } from '../../shared/ui/empty-state';

interface Kpi {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly tone: 'primary' | 'neutral' | 'warning' | 'success';
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    EmptyState,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly inventory = inject(InventoryService);
  private readonly movements = inject(MovementService);

  protected readonly labels = MOVEMENT_LABELS;
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly data = signal<DashboardData | null>(null);
  protected readonly recentMovements = signal<Movement[]>([]);
  protected readonly updatedAt = signal<Date | null>(null);

  protected readonly kpis = computed<Kpi[]>(() => {
    const summary = this.data();
    if (!summary) {
      return [];
    }

    return [
      {
        icon: 'category',
        label: 'Productos activos',
        value: String(summary.productCount),
        caption: summary.productCount === 1 ? 'producto en catálogo' : 'productos en catálogo',
        tone: 'primary',
      },
      {
        icon: 'box',
        label: 'Unidades en bodega',
        value: String(summary.totalUnits),
        caption: 'suma de todas las existencias',
        tone: 'neutral',
      },
      {
        icon: 'money',
        label: 'Valor del inventario',
        value: `$ ${summary.inventoryValue.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`,
        caption: 'precio unitario × existencias',
        tone: 'success',
      },
      {
        icon: 'warning',
        label: 'Bajo stock',
        value: String(summary.lowStockCount),
        caption: summary.lowStockCount === 0 ? 'todo por encima del mínimo' : 'productos por reponer',
        tone: summary.lowStockCount > 0 ? 'warning' : 'neutral',
      },
    ];
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      dashboard: this.inventory.dashboard(),
      movements: this.movements.list(6),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ dashboard, movements }) => {
          this.data.set(dashboard);
          this.recentMovements.set(movements);
          this.updatedAt.set(new Date());
        },
        error: (error: unknown) => this.error.set(apiErrorMessage(error, 'No se pudo cargar el panel.')),
      });
  }

  protected missingUnits(quantity: number, minimum: number): number {
    return Math.max(minimum - quantity, 0);
  }
}
