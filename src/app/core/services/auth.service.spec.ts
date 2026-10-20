import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';

const SESSION_KEY = 'bodegaflow.session';

function configure(): void {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
}

describe('AuthService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    configure();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('guarda el token y el usuario al iniciar sesión', () => {
    const service = TestBed.inject(AuthService);
    let email = '';

    service.login({ email: 'demo@bodegaflow.dev', password: 'BodegaFlow2026!' }).subscribe((user) => {
      email = user.email;
    });

    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'demo@bodegaflow.dev',
      password: 'BodegaFlow2026!',
    });

    request.flush({
      accessToken: 'token-1',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      user: { id: 'u-1', email: 'demo@bodegaflow.dev' },
    });

    expect(email).toBe('demo@bodegaflow.dev');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('token-1');
    expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}').accessToken).toBe('token-1');
  });

  it('cierra la sesión al llamar logout', () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        accessToken: 'token-1',
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        user: { id: 'u-1', email: 'demo@bodegaflow.dev' },
      }),
    );
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);

    service.logout(false);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('descarta una sesión vencida guardada en el navegador', () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        accessToken: 'token-viejo',
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
        user: { id: 'u-1', email: 'demo@bodegaflow.dev' },
      }),
    );
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
