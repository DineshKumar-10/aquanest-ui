import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, switchMap } from 'rxjs';

export interface OrderLineRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  items: OrderLineRequest[];
}

export interface OrderConfirmation {
  orderNumber: string;
  totalAmount: number;
  status: string;
  message: string;
}

interface CsrfResponse {
  token: string;
  headerName: string;
  parameterName: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly http = inject(HttpClient);

  placeOrder(
    request: CreateOrderRequest
  ): Observable<OrderConfirmation> {

    // Get a fresh CSRF cookie before submitting a guest order.
    return this.http.get<CsrfResponse>(
      '/api/auth/csrf'
    ).pipe(
      switchMap(() =>
        this.http.post<OrderConfirmation>(
          '/api/orders/requests',
          request
        )
      )
    );
  }
}