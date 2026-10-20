import { Injectable, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

import { APP_ICONS } from './app-icons';

/** Registra el set de iconos SVG incluido en la aplicación. */
@Injectable({ providedIn: 'root' })
export class IconService {
  private readonly registry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  register(): void {
    for (const [name, path] of Object.entries(APP_ICONS)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg>`;
      this.registry.addSvgIconLiteral(name, this.sanitizer.bypassSecurityTrustHtml(svg));
    }
  }
}
