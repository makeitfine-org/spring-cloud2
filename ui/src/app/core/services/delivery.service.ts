import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Delivery } from '../../shared/models/types';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private http = inject(HttpClient);

  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>('/api/deliveries');
  }

  getDeliveryByOrderId(orderId: number): Observable<Delivery> {
    return this.http.get<Delivery>(`/api/deliveries/order/${orderId}`);
  }
}
