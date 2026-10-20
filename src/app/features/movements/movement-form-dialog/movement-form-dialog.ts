import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';

import { InventoryService } from '../../../core/services/inventory.service';
import { MovementService } from '../../../core/services/movement.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { Movement, MovementRequest, MovementType, StockItem } from '../../../core/models/inventory.models';

@Component({
  selector: 'app-movement-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './movement-form-dialog.html',
  styleUrl: './movement-form-dialog.scss',
})
export class MovementFormDialog {
  private readonly dialogRef = inject(MatDialogRef<MovementFormDialog, Movement>);
  private readonly inventory = inject(InventoryService);
  private readonly movementService = inject(MovementService);

  protected readonly stock = signal<StockItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    productId: ['', [Validators.required]],
    type: ['Entry' as MovementType, [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(1_000_000)]],
    note: ['', [Validators.maxLength(500)]],
  });

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly selectedProduct = computed(() => {
    const productId = this.value().productId ?? '';
    return this.stock().find((item) => item.productId === productId) ?? null;
  });

  protected readonly isExit = computed(() => this.value().type === 'Exit');

  protected readonly quantity = computed(() => {
    const raw = Number(this.value().quantity);
    return Number.isFinite(raw) && raw > 0 ? Math.trunc(raw) : 0;
  });

  protected readonly resultingStock = computed(() => {
    const product = this.selectedProduct();
    if (!product) {
      return null;
    }
    return this.isExit() ? product.quantity - this.quantity() : product.quantity + this.quantity();
  });

  protected readonly exceedsStock = computed(() => {
    const product = this.selectedProduct();
    return !!product && this.isExit() && this.quantity() > product.quantity;
  });

  constructor() {
    this.inventory
      .stock()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => this.stock.set(items),
        error: (error: unknown) =>
          this.error.set(apiErrorMessage(error, 'No se pudieron cargar los productos.')),
      });
  }

  protected save(): void {
    if (this.form.invalid || this.exceedsStock()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: MovementRequest = {
      productId: raw.productId,
      type: raw.type as MovementType,
      quantity: Math.trunc(Number(raw.quantity)),
      note: raw.note.trim() ? raw.note.trim() : null,
    };

    this.saving.set(true);
    this.error.set(null);

    this.movementService
      .register(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (movement) => this.dialogRef.close(movement),
        error: (error: unknown) =>
          this.error.set(apiErrorMessage(error, 'No se pudo registrar el movimiento.')),
      });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected stockLabel(item: StockItem): string {
    return `${item.name} · ${item.sku} · ${item.quantity} un.`;
  }
}
