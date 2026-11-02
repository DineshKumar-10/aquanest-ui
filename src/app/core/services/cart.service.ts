import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  productId: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

const STORAGE_KEY = 'aquanest-cart';
const MAX_QUANTITY_PER_PRODUCT = 20;

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly cartItems = signal<CartItem[]>(
    this.loadCart()
  );

  readonly items = this.cartItems.asReadonly();

  readonly itemCount = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.quantity,
      0
    )
  );

  readonly estimatedTotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  );

  addProduct(product: Product): boolean {

    if (!product.inStock) {
      return false;
    }

    const existing = this.cartItems().find(
      item => item.productId === product.id
    );

    if (
      existing &&
      existing.quantity >= MAX_QUANTITY_PER_PRODUCT
    ) {
      return false;
    }

    const updated = existing
      ? this.cartItems().map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [
          ...this.cartItems(),
          {
            productId: product.id,
            name: product.name,
            category: product.category,
            price: Number(product.price),
            imageUrl: product.imageUrl,
            quantity: 1
          }
        ];

    this.cartItems.set(updated);
    this.persistCart();

    return true;
  }

  updateQuantity(productId: number, quantity: number): void {

    if (!Number.isInteger(quantity)) {
      return;
    }

    if (quantity <= 0) {
      this.removeProduct(productId);
      return;
    }

    if (quantity > MAX_QUANTITY_PER_PRODUCT) {
      return;
    }

    const updated = this.cartItems().map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    );

    this.cartItems.set(updated);
    this.persistCart();
  }

  removeProduct(productId: number): void {

    const updated = this.cartItems().filter(
      item => item.productId !== productId
    );

    this.cartItems.set(updated);
    this.persistCart();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.persistCart();
  }

  private loadCart(): CartItem[] {

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item): item is CartItem =>
          item !== null &&
          typeof item === 'object' &&
          Number.isInteger(item.productId) &&
          item.productId > 0 &&
          typeof item.name === 'string' &&
          typeof item.category === 'string' &&
          typeof item.price === 'number' &&
          Number.isFinite(item.price) &&
          item.price > 0 &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1 &&
          item.quantity <= MAX_QUANTITY_PER_PRODUCT &&
          (
            item.imageUrl === null ||
            typeof item.imageUrl === 'string'
          )
      );
    } catch {
      return [];
    }
  }

  private persistCart(): void {

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.cartItems())
      );
    } catch {
      // The cart remains usable during this page session
      // even when browser storage is unavailable.
      console.warn('Unable to persist the AquaNest cart.');
    }
  }
}