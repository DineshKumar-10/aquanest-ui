import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { PageResponse } from '../../core/models/page-response.model';

export interface AdminProduct {
  id: number;
  name: string;
  categoryId: number;
  category: string;
  price: number | string;
  stock: number;
  description: string;
  imageUrl: string | null;
  active: boolean;
}

export interface ProductWriteRequest {
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  description: string;
  imageUrl: string | null;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  activeCategories: number;
  unitsInStock: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin';

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${this.apiUrl}/dashboard`
    );
  }

  getProducts(): Observable<PageResponse<AdminProduct>> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 100);

    return this.http.get<PageResponse<AdminProduct>>(
      `${this.apiUrl}/products`,
      { params }
    );
  }

  createProduct(
    request: ProductWriteRequest
  ): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(
      `${this.apiUrl}/products`,
      request
    );
  }

  updateProduct(
    id: number,
    request: ProductWriteRequest
  ): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(
      `${this.apiUrl}/products/${id}`,
      request
    );
  }

  updateStock(
    id: number,
    stock: number
  ): Observable<AdminProduct> {
    return this.http.patch<AdminProduct>(
      `${this.apiUrl}/products/${id}/stock`,
      { stock }
    );
  }

  deactivateProduct(
    id: number
  ): Observable<AdminProduct> {
    return this.http.patch<AdminProduct>(
      `${this.apiUrl}/products/${id}/deactivate`,
      {}
    );
  }
}
