import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  readonly label: string;
  readonly hint: string;
  readonly route: string;
  readonly icon: string;
}

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly router = inject(Router);
  private readonly breakpoint = inject(BreakpointObserver);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Panel', hint: 'Resumen general', route: '/dashboard', icon: 'dashboard' },
    { label: 'Productos', hint: 'Catálogo de la bodega', route: '/productos', icon: 'category' },
    { label: 'Inventario', hint: 'Existencias y valor', route: '/inventario', icon: 'inventory' },
    { label: 'Movimientos', hint: 'Entradas y salidas', route: '/movimientos', icon: 'swap' },
  ];

  protected readonly isHandset = toSignal(
    this.breakpoint.observe('(max-width: 960px)').pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  protected readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly activeItem = computed(
    () => this.navItems.find((item) => this.url().startsWith(item.route)) ?? this.navItems[0],
  );

  protected readonly initials = computed(() => {
    const email = this.auth.user()?.email ?? '';
    return email.slice(0, 1).toUpperCase() || '?';
  });

  protected closeOnHandset(drawer: MatSidenav): void {
    if (this.isHandset()) {
      void drawer.close();
    }
  }

  protected logout(): void {
    this.auth.logout();
  }
}
