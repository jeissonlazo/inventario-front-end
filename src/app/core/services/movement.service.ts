import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE } from '../api/api.config';
import { Movement, MovementRequest } from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class MovementService {
  private readonly http = inject(HttpClient);

  list(limit = 100): Observable<Movement[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<Movement[]>(`${API_BASE}/movements`, { params });
  }

  register(payload: MovementRequest): Observable<Movement> {
    return this.http.post<Movement>(`${API_BASE}/movements`, payload);
  }
}
