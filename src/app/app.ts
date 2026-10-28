import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CatalogService } from './core/services/catalog.service';
import { Product } from './core/models/product.model';
import { Category } from './core/models/category.model';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  private readonly catalogService = inject(CatalogService);

  readonly currentYear = new Date().getFullYear();

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly selectedCategory = signal('');
  readonly selectedProduct = signal<Product | null>(null);

  readonly pageSize = 12;

  searchTerm = '';

  readonly fallbackImage =
    'https://placehold.co/800x600/eaf4f0/284b43?text=AquaNest+Fish';

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error: unknown) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');

    this.catalogService.getProducts({
      search: this.searchTerm,
      category: this.selectedCategory(),
      page: this.page(),
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        this.products.set(response.content ?? []);

        this.totalElements.set(
          response.totalElements ??
          response.page?.totalElements ??
          response.content?.length ??
          0
        );

        this.totalPages.set(
          response.totalPages ??
          response.page?.totalPages ??
          0
        );

        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load products:', error);

        this.error.set(
          'Unable to load fish right now. Please check that the backend is running and try again.'
        );

        this.loading.set(false);
      }
    });
  }

  submitSearch(): void {
    this.page.set(0);
    this.loadProducts();
  }

  chooseCategory(categoryName: string): void {
    this.selectedCategory.set(categoryName);
    this.page.set(0);
    this.loadProducts();
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(current => current - 1);
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(current => current + 1);
      this.loadProducts();
    }
  }

  openProductDetails(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeProductDetails(): void {
    this.selectedProduct.set(null);
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    image.onerror = null;
    image.src = this.fallbackImage;
  }
}