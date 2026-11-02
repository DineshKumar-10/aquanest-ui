import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {

  readonly cartService = inject(CartService);

  readonly fallbackImage =
    'https://placehold.co/300x240/eaf4f0/284b43?text=AquaNest';
    

    readonly currentYear = new Date().getFullYear();

  increase(productId: number, currentQuantity: number): void {
    this.cartService.updateQuantity(
      productId,
      currentQuantity + 1
    );
  }

  decrease(productId: number, currentQuantity: number): void {
    this.cartService.updateQuantity(
      productId,
      currentQuantity - 1
    );
  }

  remove(productId: number): void {
    this.cartService.removeProduct(productId);
  }
}