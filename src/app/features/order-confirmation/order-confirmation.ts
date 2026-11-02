import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss'
})
export class OrderConfirmation {

  private readonly route = inject(ActivatedRoute);

  readonly orderNumber =
    this.route.snapshot.queryParamMap.get('orderNumber');

  readonly status =
    this.route.snapshot.queryParamMap.get('status');

  readonly totalAmount = Number(
    this.route.snapshot.queryParamMap.get('totalAmount')
  );

  readonly validConfirmation =
    !!this.orderNumber &&
    this.status === 'PENDING_CONFIRMATION' &&
    Number.isFinite(this.totalAmount) &&
    this.totalAmount >= 0;
}