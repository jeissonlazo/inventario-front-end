import { HttpErrorResponse } from '@angular/common/http';

/** Cuerpo de error de ASP.NET Core: ProblemDetails con `errors`, `message` o `detail`. */
interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Traduce cualquier error HTTP del API a un mensaje legible en español.
 * El backend responde ValidationProblem (400), Conflict { message } (409) y
 * ProblemDetails genérico (500).
 */
export function apiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (error.status === 0) {
    return 'No se pudo contactar con el servidor. Verifica que el API esté en marcha en http://localhost:5070.';
  }

  const body = error.error as ProblemDetails | string | null;

  if (body && typeof body === 'object') {
    if (body.errors) {
      const messages = Object.values(body.errors).flat().filter(Boolean);
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
    if (body.message) {
      return body.message;
    }
    if (body.detail) {
      return body.detail;
    }
    if (body.title) {
      return body.title;
    }
  }

  if (typeof body === 'string' && body.trim().length > 0) {
    return body;
  }

  switch (error.status) {
    case 401:
      return 'Tu sesión expiró. Inicia sesión de nuevo.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no existe.';
    default:
      return `${fallback} (HTTP ${error.status})`;
  }
}
