import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { IconService } from './core/icons/icon.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly icons = inject(IconService);

  constructor() {
    // El tema se instancia al arrancar para aplicar la preferencia guardada.
    inject(ThemeService);
    this.icons.register();
  }
}
