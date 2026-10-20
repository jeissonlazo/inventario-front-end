import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable, finalize, map } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { Product, ProductRequest } from '../../../core/models/inventory.models';

export type ProductFormResult = 'created' | 'updated';

export interface ProductFormDialogData {
  product: Product | null;
}

@Component({
  selector: 'app-product-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './product-form-dialog.html',
  styleUrl: './product-form-dialog.scss',
})
export class ProductFormDialog {
  protected readonly data = inject<ProductFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialog, ProductFormResult>);
  private readonly productService = inject(ProductService);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isEdit = this.data.product !== null;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    sku: [this.data.product?.sku ?? '', [Validators.required, Validators.maxLength(40)]],
    name: [this.data.product?.name ?? '', [Validators.required, Validators.maxLength(160)]],
    description: [this.data.product?.description ?? '', [Validators.maxLength(500)]],
    unitPrice: [
      this.data.product?.unitPrice ?? 0,
      [Validators.required, Validators.min(0), Validators.max(999_999_999)],
    ],
    minimumStock: [
      this.data.product?.minimumStock ?? 0,
      [Validators.required, Validators.min(0), Validators.max(1_000_000)],
    ],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ProductRequest = {
      sku: raw.sku.trim().toUpperCase(),
      name: raw.name.trim(),
      description: raw.description.trim() ? raw.description.trim() : null,
      unitPrice: Number(raw.unitPrice),
      minimumStock: Math.trunc(Number(raw.minimumStock)),
    };

    const id = this.data.product?.id;
    this.saving.set(true);
    this.error.set(null);

    const request$: Observable<ProductFormResult> = id
      ? this.productService.update(id, payload).pipe(map((): ProductFormResult => 'updated'))
      : this.productService.create(payload).pipe(map((): ProductFormResult => 'created'));

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (result: ProductFormResult) => this.dialogRef.close(result),
      error: (error: unknown) =>
        this.error.set(apiErrorMessage(error, 'No se pudo guardar el producto.')),
    });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
