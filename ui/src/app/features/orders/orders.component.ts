import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, EMPTY } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { OrderService } from '../../core/services/order.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { CreateOrderDialogComponent } from './create-order-dialog/create-order-dialog.component';
import { Order, Delivery } from '../../shared/models/types';

type DeliveryState = Delivery | 'loading' | 'error';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent, ErrorBannerComponent, CreateOrderDialogComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-base-content">Orders</h1>
          <p class="text-sm text-base-content/60 mt-1">Auto-refreshes every 5s · click a row to see delivery</p>
        </div>
        <button class="btn btn-primary btn-sm" (click)="showDialog.set(true)">
          + Create Order
        </button>
      </div>

      <app-error-banner [error]="error()" title="Could not load orders" />

      <div class="card bg-base-200 border border-base-300">
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="7" class="text-center py-8 text-base-content/60">
                    <span class="loading loading-spinner loading-sm"></span>
                    Loading…
                  </td>
                </tr>
              } @else if (sorted().length === 0) {
                <tr>
                  <td colspan="7" class="text-center py-8 text-base-content/60">No orders yet</td>
                </tr>
              } @else {
                @for (order of sorted(); track order.id) {
                  <tr
                    class="cursor-pointer hover:bg-base-300 transition-colors"
                    (click)="toggleRow(order.id)"
                  >
                    <td class="font-mono text-xs">{{ order.id }}</td>
                    <td>{{ order.productId }}</td>
                    <td>{{ order.quantity }}</td>
                    <td>{{ formatPrice(order.price) }}</td>
                    <td><app-status-badge [status]="order.status" /></td>
                    <td class="text-xs text-base-content/60">{{ formatDate(order.createdAt) }}</td>
                    <td class="text-xs text-base-content/60">{{ formatDate(order.updatedAt) }}</td>
                  </tr>
                  @if (expandedId() === order.id) {
                    <tr class="bg-base-300/50">
                      <td colspan="7" class="px-8 py-3">
                        @let state = deliveryMap().get(order.id);
                        @if (state === 'loading') {
                          <span class="text-xs text-base-content/60 italic">Loading delivery…</span>
                        } @else if (state === 'error' || !state) {
                          <span class="text-xs text-base-content/40">No delivery linked yet</span>
                        } @else {
                          <div class="flex items-center gap-6 text-xs text-base-content/60">
                            <span>Delivery <span class="font-mono text-base-content">{{ state.id }}</span></span>
                            <app-status-badge [status]="state.status" type="delivery" />
                            @if (state.scheduledAt) {
                              <span>Scheduled: {{ formatDate(state.scheduledAt) }}</span>
                            }
                          </div>
                        }
                      </td>
                    </tr>
                  }
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    @if (showDialog()) {
      <app-create-order-dialog
        (closed)="showDialog.set(false)"
        (created)="onOrderCreated()"
      />
    }
  `,
})
export class OrdersComponent {
  private orderService = inject(OrderService);
  private deliveryService = inject(DeliveryService);
  private destroyRef = inject(DestroyRef);

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<unknown>(null);
  showDialog = signal(false);
  expandedId = signal<number | null>(null);
  deliveryMap = signal<Map<number, DeliveryState>>(new Map());

  sorted = computed(() =>
    [...this.orders()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  constructor() {
    interval(5000).pipe(
      startWith(0),
      switchMap(() =>
        this.orderService.getOrders().pipe(
          catchError(err => { this.error.set(err); return EMPTY; })
        )
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => {
      this.orders.set(data);
      this.loading.set(false);
      this.error.set(null);
    });
  }

  toggleRow(orderId: number): void {
    if (this.expandedId() === orderId) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(orderId);
    if (this.deliveryMap().has(orderId)) return;

    this.deliveryMap.update(m => new Map(m).set(orderId, 'loading'));

    this.deliveryService.getDeliveryByOrderId(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: delivery => this.deliveryMap.update(m => new Map(m).set(orderId, delivery)),
        error: () => this.deliveryMap.update(m => new Map(m).set(orderId, 'error')),
      });
  }

  onOrderCreated(): void {
    // next poll interval will refresh automatically
  }

  formatDate(ts: string | undefined): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString();
  }

  formatPrice(price: number | undefined): string {
    return price != null ? `$${price.toFixed(2)}` : '—';
  }
}
