import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../core/auth/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { Category } from '../../core/models/category.model';

import {
  AdminProduct,
  AdminProductService,
  DashboardStats,
  ProductWriteRequest
} from './admin-product.service';

interface ProductForm {
  id: number | null;
  name: string;
  categoryId: number | null;
  price: number | null;
  stock: number | null;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly catalogService = inject(CatalogService);
  private readonly adminService = inject(AdminProductService);
  private readonly router = inject(Router);

  readonly categories = signal<Category[]>([]);
  readonly products = signal<AdminProduct[]>([]);
  readonly stats = signal<DashboardStats | null>(null);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly adminUsername =
    this.authService.currentUser()?.username ?? 'Administrator';

  form: ProductForm = this.emptyForm();

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadStats();
  }

  private emptyForm(): ProductForm {
    return {
      id: null,
      name: '',
      categoryId: null,
      price: null,
      stock: 0,
      description: '',
      imageUrl: ''
    };
  }

  loadCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: categories => {
        this.categories.set(categories);

        if (this.form.categoryId === null && categories.length) {
          this.form.categoryId = categories[0].id;
        }
      },
      error: () => {
        this.errorMessage.set('Unable to load product categories.');
      }
    });
  }

  loadProducts(): void {
    this.loading.set(true);

    this.adminService.getProducts().subscribe({
      next: response => {
        this.products.set(response.content ?? []);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  loadStats(): void {
    this.adminService.getDashboard().subscribe({
      next: stats => this.stats.set(stats),
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  saveProduct(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (
      !this.form.name.trim() ||
      this.form.categoryId === null ||
      this.form.price === null ||
      this.form.stock === null ||
      !Number.isFinite(Number(this.form.price)) ||
      !Number.isInteger(Number(this.form.stock)) ||
      Number(this.form.price) <= 0 ||
      Number(this.form.stock) < 0 ||
      Number(this.form.stock) > 100000 ||
      !this.form.description.trim()
    ) {
      this.errorMessage.set(
        'Enter a valid name, category, positive price, non-negative stock and description.'
      );
      return;
    }

    const editingId = this.form.id;

    const request: ProductWriteRequest = {
      name: this.form.name.trim(),
      categoryId: Number(this.form.categoryId),
      price: Number(this.form.price),
      stock: Number(this.form.stock),
      description: this.form.description.trim(),
      imageUrl: this.form.imageUrl.trim() || null
    };

    this.saving.set(true);

    const operation = editingId === null
      ? this.adminService.createProduct(request)
      : this.adminService.updateProduct(editingId, request);

    operation.subscribe({
      next: () => {
        this.saving.set(false);

        this.successMessage.set(
          editingId === null
            ? 'Product created successfully.'
            : 'Product updated successfully.'
        );

        this.form = this.emptyForm();
        this.form.categoryId =
          this.categories()[0]?.id ?? null;

        this.loadProducts();
        this.loadStats();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  editProduct(product: AdminProduct): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.form = {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      price: Number(product.price),
      stock: product.stock,
      description: product.description,
      imageUrl: product.imageUrl ?? ''
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  cancelEdit(): void {
    this.form = this.emptyForm();
    this.form.categoryId = this.categories()[0]?.id ?? null;

    this.errorMessage.set('');
    this.successMessage.set('');
  }

  updateStock(product: AdminProduct): void {
    const stock = Number(product.stock);

    if (
      !Number.isInteger(stock) ||
      stock < 0 ||
      stock > 100000
    ) {
      this.errorMessage.set(
        'Stock must be a whole number between 0 and 100000.'
      );
      this.loadProducts();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminService
      .updateStock(product.id, stock)
      .subscribe({
        next: () => {
          this.successMessage.set(
            `Stock updated for ${product.name}.`
          );

          this.loadProducts();
          this.loadStats();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.loadProducts();
        }
      });
  }

  deactivateProduct(product: AdminProduct): void {
    if (!product.active) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate "${product.name}"? It will no longer appear in the public catalogue.`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminService.deactivateProduct(product.id).subscribe({
      next: () => {
        this.successMessage.set(
          `${product.name} has been deactivated.`
        );

        this.loadProducts();
        this.loadStats();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/admin/login');
      },
      error: () => {
        this.errorMessage.set(
          'Logout could not be confirmed. Please check your connection and retry.'
        );
      }
    });
  }

  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (error.status === 401) {
      return 'Your session has expired or you are not signed in. Please log in again.';
    }

    if (error.status === 403) {
      return 'Access denied. Check administrator authorization and the CSRF token.';
    }

    if (error.status === 400) {
      return 'The server rejected the submitted data. Check your values and try again.';
    }

    if (error.status === 0) {
      return 'Unable to reach the API. Confirm Spring Boot is running and the proxy is configured.';
    }

    return 'The operation failed. Please try again.';
  }
}