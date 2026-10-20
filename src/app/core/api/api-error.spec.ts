import { HttpErrorResponse } from '@angular/common/http';

import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  it('usa el mensaje del API en un conflicto', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { message: 'El SKU ya está registrado.' },
    });

    expect(apiErrorMessage(error)).toBe('El SKU ya está registrado.');
  });

  it('une los errores de validación de un ValidationProblem', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'One or more validation errors occurred.',
        errors: {
          sku: ['El SKU es obligatorio y debe tener máximo 40 caracteres.'],
          name: ['El nombre es obligatorio y debe tener máximo 160 caracteres.'],
        },
      },
    });

    expect(apiErrorMessage(error)).toBe(
      'El SKU es obligatorio y debe tener máximo 40 caracteres. El nombre es obligatorio y debe tener máximo 160 caracteres.',
    );
  });

  it('explica la falta de conexión', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(apiErrorMessage(error)).toContain('No se pudo contactar con el servidor');
  });

  it('expone el detalle del ProblemDetails', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { detail: 'Ocurrió un error inesperado. Intenta de nuevo.' },
    });

    expect(apiErrorMessage(error)).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
  });
});
