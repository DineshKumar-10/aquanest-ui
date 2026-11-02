import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CartService } from '../../core/services/cart.service';
import {
  CreateOrderRequest,
  OrderService
} from '../../core/services/order.service';

interface CheckoutForm {
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {

  readonly cartService = inject(CartService);

  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  form: CheckoutForm = {
    customerName: '',
    email: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: ''
  };

  submitOrder(): void {

    if (this.cartService.items().length === 0) {
      this.errorMessage.set('Your shopping cart is empty.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const request: CreateOrderRequest = {
      customerName: this.form.customerName.trim(),
      email: this.form.email.trim(),
      phone: this.form.phone.trim(),
      addressLine: this.form.addressLine.trim(),
      city: this.form.city.trim(),
      state: this.form.state.trim(),
      postalCode: this.form.postalCode.trim(),

      // Only product IDs and quantities are sent.
      // Never send prices calculated from the browser.
      items: this.cartService.items().map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    this.orderService.placeOrder(request).subscribe({
      next: response => {

        this.cartService.clearCart();
        this.submitting.set(false);

        void this.router.navigate(
          ['/order-confirmation'],
          {
            queryParams: {
              orderNumber: response.orderNumber,
              totalAmount: response.totalAmount,
              status: response.status
            }
          }
        );
      },

      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);

        if (error.status === 409) {
          this.errorMessage.set(
            error.error?.detail ??
            'Some selected fish are no longer available. Please review your cart.'
          );
        } else if (error.status === 400) {
          this.errorMessage.set(
            error.error?.detail ??
            'Please check your delivery details and product quantities.'
          );
        } else if (error.status === 0) {
          this.errorMessage.set(
            'Unable to connect to the server. Please try again.'
          );
        } else {
          this.errorMessage.set(
            'Unable to submit your order request. Please try again.'
          );
        }
      }
    });
  }
}