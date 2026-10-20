import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';

import { InventoryService } from '../../../core/services/inventory.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { StockItem } from '../../../core/models/inventory.models';
import { EmptyState } from '../../../shared/ui/empty-state';

@Component({
  selector: 'app-inventory-list',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatTableModule,
    EmptyState,
  ],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.scss',
})
export class InventoryList {
  private readonly inventory = inject(InventoryService);

  protected readonly columns = ['sku', 'name', 'quantity', 'minimumStock', 'unitPrice', 'stockValue', 'status'];
  protected readonly filterControl = new FormControl('', { nonNullable: true });
  protected readonly items = signal<StockItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly onlyLowStock = signal(false);

  private readonly term = signal('');

  protected readonly filtered = computed(() => {
    const search = this.term().toLowerCase();
    const onlyLow = this.onlyLowStock();

    return this.items().filter((item) => {
      const matchesSearch =
        !search || item.name.toLowerCase().includes(search) || item.sku.toLowerCase().includes(search);
      const isLow = item.quantity <= item.minimumStock;
      return matchesSearch && (!onlyLow || isLow);
    });
  });

  protected readonly totals = computed(() => {
    const list = this.filtered();
    return {
      units: list.reduce((total, item) => total + item.quantity, 0),
      value: list.reduce((total, item) => total + item.stockValue, 0),
      low: list.filter((item) => item.quantity <= item.minimumStock).length,
    };
  });

  constructor() {
    this.filterControl.valueChanges.subscribe((value) => this.term.set(value.trim()));
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.inventory
      .stock()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => this.items.set(items),
        error: (error: unknown) =>
          this.error.set(apiErrorMessage(error, 'No se pudo cargar el inventario.')),
      });
  }

  protected statusOf(item: StockItem): 'ok' | 'low' | 'empty' {
    if (item.quantity === 0) {
      return 'empty';
    }
    return item.quantity <= item.minimumStock ? 'low' : 'ok';
  }

  protected exportCsv(): void {
    const rows: (string | number)[][] = [
      ['SKU', 'Producto', 'Existencias', 'Stock minimo', 'Precio unitario', 'Valor'],
      ...this.filtered().map((item) => [
        item.sku,
        item.name,
        item.quantity,
        item.minimumStock,
        item.unitPrice,
        item.stockValue,
      ]),
    ];

    // Separador ";" y BOM para que Excel en español abra el archivo correctamente.
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
