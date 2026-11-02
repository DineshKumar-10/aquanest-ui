
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PageResponse } from '../../core/models/page-response.model';

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AdminOrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: AdminOrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin/orders';

  getOrders(): Observable<PageResponse<AdminOrder>> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 50);

    return this.http.get<PageResponse<AdminOrder>>(
      this.apiUrl,
      { params }
    );
  }

  updateOrderStatus(
    id: number,
    status: OrderStatus
  ): Observable<AdminOrder> {
    return this.http.patch<AdminOrder>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }
}