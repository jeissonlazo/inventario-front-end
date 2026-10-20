import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE } from '../api/api.config';
import { Dashboard, StockItem } from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);

  stock(): Observable<StockItem[]> {
    return this.http.get<StockItem[]>(`${API_BASE}/inventory`);
  }

  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${API_BASE}/dashboard`);
  }
}
