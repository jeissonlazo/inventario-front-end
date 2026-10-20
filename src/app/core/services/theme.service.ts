import { computed, effect, inject, Injectable, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'bodegaflow.theme';

function readTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Sin almacenamiento disponible: se usa la preferencia del sistema.
  }
  const prefersDark =
    typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/** Alterna el tema claro/oscuro aplicando la clase .dark en <html>. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly mode = signal<ThemeMode>(readTheme());

  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      try {
        localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
      } catch {
        // Ignorado: el tema se mantiene en memoria.
      }
    });
  }

  toggle(): void {
    this.mode.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }
}
