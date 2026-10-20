import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE } from '../api/api.config';
import { Product, ProductRequest } from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  list(search = ''): Observable<Product[]> {
    const term = search.trim();
    const params = term ? new HttpParams().set('search', term) : undefined;
    return this.http.get<Product[]>(`${API_BASE}/products`, { params });
  }

  create(payload: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${API_BASE}/products`, payload);
  }

  update(id: string, payload: ProductRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE}/products/${id}`, payload);
  }

  /** El API hace baja lógica: marca isActive = false. */
  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/products/${id}`);
  }
}
