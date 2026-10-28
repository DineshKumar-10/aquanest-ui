import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { PageResponse } from '../models/page-response.model';

export interface ProductQuery {
  search?: string;
  category?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly http = inject(HttpClient);

  // private readonly apiUrl = 'http://localhost:8080/api';

  private readonly apiUrl = '/api';

  
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.apiUrl}/categories`
    );
  }

  getProducts(
    query: ProductQuery = {}
  ): Observable<PageResponse<Product>> {

    let params = new HttpParams()
      .set('page', String(query.page ?? 0))
      .set('size', String(query.size ?? 12));

    const search = query.search?.trim();
    const category = query.category?.trim();

    if (search) {
      params = params.set('search', search);
    }

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<PageResponse<Product>>(
      `${this.apiUrl}/products`,
      { params }
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(
      `${this.apiUrl}/products/${id}`
    );
  }
}