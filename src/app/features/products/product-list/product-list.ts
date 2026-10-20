import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, finalize, forkJoin, of } from 'rxjs';

import { ProductService } from '../../../core/services/product.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { NotificationService } from '../../../core/services/notification.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { Product, StockItem } from '../../../core/models/inventory.models';
import { EmptyState } from '../../../shared/ui/empty-state';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/ui/confirm-dialog';
import { ProductFormDialog, ProductFormResult } from '../product-form-dialog/product-form-dialog';

@Component({
  selector: 'app-product-list',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,
    EmptyState,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly inventoryService = inject(InventoryService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  protected readonly columns = ['sku', 'name', 'unitPrice', 'minimumStock', 'stock', 'status', 'actions'];
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly search = signal('');
  protected readonly products = signal<Product[]>([]);
  protected readonly stock = signal<StockItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly showInactive = signal(false);

  protected readonly visibleProducts = computed(() => {
    const list = this.products();
    return this.showInactive() ? list : list.filter((product) => product.isActive);
  });

  private readonly stockByProduct = computed(
    () => new Map(this.stock().map((item) => [item.productId, item.quantity] as const)),
  );

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => {
        this.search.set(term.trim());
        this.load();
      });

    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      products: this.productService.list(this.search()),
      stock: this.inventoryService.stock().pipe(catchError(() => of<StockItem[]>([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ products, stock }) => {
          this.products.set(products);
          this.stock.set(stock);
        },
        error: (error: unknown) =>
          this.error.set(apiErrorMessage(error, 'No se pudieron cargar los productos.')),
      });
  }

  protected stockOf(productId: string): number | undefined {
    return this.stockByProduct().get(productId);
  }

  protected openCreate(): void {
    this.openDialog(null);
  }

  protected openEdit(product: Product): void {
    this.openDialog(product);
  }

  protected deactivate(product: Product): void {
    const data: ConfirmDialogData = {
      title: 'Dar de baja el producto',
      message: `«${product.name}» dejará de aparecer en el inventario y no admitirá nuevos movimientos. Los movimientos ya registrados se conservan.`,
      confirmLabel: 'Dar de baja',
      destructive: true,
    };

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data,
        width: '440px',
        autoFocus: 'dialog',
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.productService.deactivate(product.id).subscribe({
          next: () => {
            this.notifications.success(`«${product.name}» quedó dado de baja.`);
            this.load();
          },
          error: (error: unknown) => {
            this.notifications.error(apiErrorMessage(error, 'No se pudo dar de baja el producto.'));
          },
        });
      });
  }

  private openDialog(product: Product | null): void {
    this.dialog
      .open<ProductFormDialog, { product: Product | null }, ProductFormResult>(ProductFormDialog, {
        data: { product },
        width: '560px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.notifications.success(
          result === 'created' ? 'Producto creado correctamente.' : 'Producto actualizado.',
        );
        this.load();
      });
  }
}
