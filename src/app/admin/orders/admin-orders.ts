import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// import {
//   AdminOrder,
//   AdminOrderService,
//   OrderStatus
// } from '../dashboard/admin-order.service';


// import {
//   AdminOrderService,
//   OrderStatus
// } from './admin-order.service';


import {
  AdminOrderService,
  AdminOrder,
  OrderStatus
} from './admin-order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss'
})
export class AdminOrders implements OnInit {

  private readonly orderService = inject(AdminOrderService);

  readonly orders = signal<AdminOrder[]>([]);
  readonly loading = signal(true);
  readonly updating = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly expandedOrders = signal<number[]>([]);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.orderService.getOrders().subscribe({
      next: response => {
        this.orders.set(response.content ?? []);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  toggleDetails(orderId: number): void {

    this.expandedOrders.update(current =>
      current.includes(orderId)
        ? current.filter(id => id !== orderId)
        : [...current, orderId]
    );
  }

  isExpanded(orderId: number): boolean {
    return this.expandedOrders().includes(orderId);
  }

  updateStatus(
    order: AdminOrder,
    status: OrderStatus
  ): void {

    const messages: Record<OrderStatus, string> = {
      PENDING_CONFIRMATION: 'Return this order to pending confirmation?',
      CONFIRMED: 'Confirm this order? Inventory will be deducted.',
      REJECTED: 'Reject this order request?',
      COMPLETED: 'Mark this order as completed?',
      CANCELLED: 'Cancel this confirmed order? Inventory will be restored.'
    };

    if (!window.confirm(messages[status])) {
      return;
    }

    this.updating.set(order.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.orderService.updateOrderStatus(
      order.id,
      status
    ).subscribe({
      next: () => {
        this.updating.set(null);
        this.successMessage.set(
          `Order ${order.orderNumber} updated successfully.`
        );
        this.loadOrders();
      },
      error: (error: HttpErrorResponse) => {
        this.updating.set(null);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  statusLabel(status: OrderStatus): string {
    return status.replaceAll('_', ' ');
  }

  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (error.status === 401) {
      return 'Your admin session has expired. Please log in again.';
    }

    if (error.status === 403) {
      return 'Access denied or CSRF validation failed.';
    }

    if (error.status === 404) {
      return 'The order could not be found.';
    }

    if (error.status === 409) {
      return error.error?.detail ??
        'The order cannot be updated because its current status or stock has changed.';
    }

    if (error.status === 0) {
      return 'Unable to connect to the backend. Check that Spring Boot is running.';
    }

    return 'Unable to process this order action.';
  }
}