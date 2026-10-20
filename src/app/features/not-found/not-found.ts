import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="notfound">
      <span class="notfound__code">404</span>
      <h1>Esta página no existe</h1>
      <p>El enlace puede haber cambiado o la dirección está mal escrita.</p>
      <a matButton="filled" routerLink="/dashboard">
        <mat-icon svgIcon="dashboard" />
        Volver al panel
      </a>
    </div>
  `,
  styles: `
    .notfound {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 100dvh;
      padding: 32px;
      text-align: center;
      background: var(--mat-sys-surface-container-low, #f6f7fb);
    }

    .notfound__code {
      font-size: 4.2rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1;
      background: linear-gradient(135deg, #0061c9, #7c3aed);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    h1 {
      margin: 0;
      font-size: 1.4rem;
    }

    p {
      margin: 0 0 12px;
      color: var(--mat-sys-on-surface-variant, #44474e);
    }
  `,
})
export class NotFound {}
