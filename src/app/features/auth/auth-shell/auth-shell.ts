import { Component } from '@angular/core';

/** Marco visual compartido por las pantallas de acceso (login y registro). */
@Component({
  selector: 'app-auth-shell',
  template: `
    <div class="auth">
      <aside class="auth__pitch">
        <div class="pitch__brand">
          <span class="pitch__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 8.2 12 4l8 4.2v7.6L12 20l-8-4.2V8.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              <path d="M4 8.2 12 12.4l8-4.2M12 12.4V20" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
            </svg>
          </span>
          <span>BodegaFlow</span>
        </div>

        <div class="pitch__body">
          <h1>Controla tu bodega sin sorpresas.</h1>
          <p>
            Productos, existencias y movimientos en un solo lugar. Cada entrada y salida queda
            registrada y el stock se actualiza al instante.
          </p>

          <ul class="pitch__list">
            <li><span>01</span> Catálogo con SKU, precio y stock mínimo</li>
            <li><span>02</span> Existencias calculadas desde los movimientos</li>
            <li><span>03</span> Alertas de bajo stock en el panel</li>
          </ul>
        </div>

        <p class="pitch__foot">API conectada a BodegaFlow · /api</p>
      </aside>

      <section class="auth__panel">
        <div class="auth__mobile-brand">
          <span class="pitch__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 8.2 12 4l8 4.2v7.6L12 20l-8-4.2V8.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              <path d="M4 8.2 12 12.4l8-4.2M12 12.4V20" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
            </svg>
          </span>
          BodegaFlow
        </div>
        <div class="auth__card">
          <ng-content />
        </div>
      </section>
    </div>
  `,
  styleUrl: './auth-shell.scss',
})
export class AuthShell {}
