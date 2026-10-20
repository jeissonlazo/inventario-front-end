import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { API_BASE } from '../api/api.config';
import { AuthUser, LoginRequest, LoginResponse, RegisterRequest } from '../models/inventory.models';

const SESSION_KEY = 'bodegaflow.session';

interface StoredSession {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.accessToken || !parsed.user?.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<StoredSession | null>(readSession());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.accessToken ?? null);
  readonly isAuthenticated = computed(() => {
    const current = this.session();
    return !!current && new Date(current.expiresAt).getTime() > Date.now();
  });

  constructor() {
    // Una sesión vencida guardada en el navegador se descarta al iniciar.
    if (this.session() && !this.isAuthenticated()) {
      this.persist(null);
    }
  }

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${API_BASE}/auth/login`, credentials).pipe(
      tap((response) =>
        this.persist({
          accessToken: response.accessToken,
          expiresAt: response.expiresAt,
          user: response.user,
        }),
      ),
      map((response) => response.user),
    );
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http.post<AuthUser>(`${API_BASE}/auth/register`, payload).pipe(map(() => undefined));
  }

  /** Comprueba contra el API que el token guardado siga siendo válido. */
  verify(): Observable<string> {
    return this.http.get<{ email: string }>(`${API_BASE}/auth/me`).pipe(map((response) => response.email));
  }

  logout(redirect = true): void {
    this.persist(null);
    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }

  /** Lo usa el interceptor cuando el API responde 401. */
  handleUnauthorized(): void {
    if (!this.session()) {
      return;
    }
    this.persist(null);
    const returnUrl = this.router.url;
    void this.router.navigate(['/login'], {
      queryParams: returnUrl.startsWith('/login') ? {} : { returnUrl },
    });
  }

  private persist(session: StoredSession | null): void {
    this.session.set(session);
    try {
      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // El almacenamiento puede estar bloqueado (modo privado); la sesión sigue en memoria.
    }
  }
}
