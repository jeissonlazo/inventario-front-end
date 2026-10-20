import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/** Diálogo de confirmación para acciones irreversibles. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" (click)="close(false)">{{ data.cancelLabel ?? 'Cancelar' }}</button>
      <button
        matButton="filled"
        type="button"
        [class.danger]="data.destructive"
        (click)="close(true)"
      >
        {{ data.confirmLabel ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .message {
      margin: 0;
      max-width: 420px;
      color: var(--mat-sys-on-surface-variant, #44474e);
      line-height: 1.55;
    }

    button.danger {
      --mat-button-filled-container-color: var(--mat-sys-error, #ba1a1a);
      --mat-button-filled-label-text-color: var(--mat-sys-on-error, #fff);
    }
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialog, boolean>);

  protected close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
