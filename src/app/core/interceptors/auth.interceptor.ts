import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Añade el token JWT a cada petición y cierra la sesión cuando el API
 * responde 401 (salvo en el propio login, donde 401 significa credenciales erróneas).
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const isAuthCall = request.url.includes('/auth/login') || request.url.includes('/auth/register');

  const authorized = token && !isAuthCall
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthCall) {
        auth.handleUnauthorized();
      }
      return throwError(() => error);
    }),
  );
};
