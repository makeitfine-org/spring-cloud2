import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem } from '../../shared/models/types';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);

  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>('/api/inventory');
  }

  getInventoryByProduct(productId: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`/api/inventory/${productId}`);
  }
}
