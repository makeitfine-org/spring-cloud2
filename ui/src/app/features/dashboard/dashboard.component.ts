import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, EMPTY } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { OrderService } from '../../core/services/order.service';
import { InventoryService } from '../../core/services/inventory.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { Order, InventoryItem, Delivery } from '../../shared/models/types';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent, ErrorBannerComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-base-content mb-6">Dashboard</h1>

      <app-error-banner [error]="ordersError()" title="Could not load orders" />
      <app-error-banner [error]="inventoryError()" title="Could not load inventory" />
      <app-error-banner [error]="deliveriesError()" title="Could not load deliveries" />

      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="card bg-base-200 border border-base-300">
          <div class="card-body p-5">
            <p class="text-sm text-base-content/60">Total Orders</p>
            <p class="text-3xl font-bold mt-1">{{ orders().length || '—' }}</p>
            <p class="text-xs text-base-content/40 mt-1">
              P:{{ statusCount('PENDING') }} C:{{ statusCount('CONFIRMED') }} X:{{ statusCount('CANCELLED') }}
            </p>
          </div>
        </div>
        <div class="card bg-base-200 border border-base-300">
          <div class="card-body p-5">
            <p class="text-sm text-base-content/60">Inventory Items</p>
            <p class="text-3xl font-bold mt-1">{{ inventory().length || '—' }}</p>
            <p class="text-xs text-base-content/40 mt-1">{{ totalAvailable() }} units available</p>
          </div>
        </div>
        <div class="card bg-base-200 border border-base-300">
          <div class="card-body p-5">
            <p class="text-sm text-base-content/60">Active Deliveries</p>
            <p class="text-3xl font-bold mt-1">{{ scheduledCount() }}</p>
            <p class="text-xs text-base-content/40 mt-1">SCHEDULED status</p>
          </div>
        </div>
        <div class="card bg-base-200 border border-base-300">
          <div class="card-body p-5">
            <p class="text-sm text-base-content/60">Confirmed Orders</p>
            <p class="text-3xl font-bold mt-1">{{ statusCount('CONFIRMED') }}</p>
            <p class="text-xs text-base-content/40 mt-1">Successfully fulfilled</p>
          </div>
        </div>
      </div>

      <!-- Recent orders table -->
      <div class="card bg-base-200 border border-base-300">
        <div class="card-body p-0">
          <div class="px-5 py-4 border-b border-base-300">
            <h2 class="text-base font-semibold">Recent Orders</h2>
            <p class="text-xs text-base-content/40 mt-0.5">Auto-refreshes every 5s</p>
          </div>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                @if (ordersLoading()) {
                  <tr>
                    <td colspan="5" class="text-center py-8 text-base-content/60">
                      <span class="loading loading-spinner loading-sm"></span>
                      Loading…
                    </td>
                  </tr>
                } @else if (recentOrders().length === 0) {
                  <tr>
                    <td colspan="5" class="text-center py-8 text-base-content/60">No orders yet</td>
                  </tr>
                } @else {
                  @for (order of recentOrders(); track order.id) {
                    <tr>
                      <td class="font-mono text-xs">{{ order.id }}</td>
                      <td>{{ order.productId }}</td>
                      <td>{{ order.quantity }}</td>
                      <td><app-status-badge [status]="order.status" /></td>
                      <td class="text-xs text-base-content/60">{{ formatDate(order.createdAt) }}</td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private orderService = inject(OrderService);
  private inventoryService = inject(InventoryService);
  private deliveryService = inject(DeliveryService);
  private destroyRef = inject(DestroyRef);

  orders = signal<Order[]>([]);
  inventory = signal<InventoryItem[]>([]);
  deliveries = signal<Delivery[]>([]);
  ordersLoading = signal(true);
  ordersError = signal<unknown>(null);
  inventoryError = signal<unknown>(null);
  deliveriesError = signal<unknown>(null);

  recentOrders = computed(() =>
    [...this.orders()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  totalAvailable = computed(() =>
    this.inventory().reduce(
      (acc, i) => acc + (i.availableQuantity ?? (i.quantity - (i.reservedQuantity ?? 0))),
      0
    )
  );

  scheduledCount = computed(() => this.deliveries().filter(d => d.status === 'SCHEDULED').length);

  statusCount(status: string): number {
    return this.orders().filter(o => o.status === status).length;
  }

  constructor() {
    interval(5000).pipe(
      startWith(0),
      switchMap(() =>
        this.orderService.getOrders().pipe(
          catchError(err => { this.ordersError.set(err); return EMPTY; })
        )
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => {
      this.orders.set(data);
      this.ordersLoading.set(false);
      this.ordersError.set(null);
    });

    this.inventoryService.getInventory()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => this.inventory.set(data),
        error: err => this.inventoryError.set(err),
      });

    interval(5000).pipe(
      startWith(0),
      switchMap(() =>
        this.deliveryService.getDeliveries().pipe(
          catchError(err => { this.deliveriesError.set(err); return EMPTY; })
        )
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => {
      this.deliveries.set(data);
      this.deliveriesError.set(null);
    });
  }

  formatDate(ts: string | undefined): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString();
  }
}
