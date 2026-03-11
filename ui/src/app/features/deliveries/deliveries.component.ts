import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, EMPTY } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { DeliveryService } from '../../core/services/delivery.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { Delivery } from '../../shared/models/types';

@Component({
  selector: 'app-deliveries',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent, ErrorBannerComponent],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-base-content">Deliveries</h1>
        <p class="text-sm text-base-content/60 mt-1">Auto-refreshes every 5s</p>
      </div>

      <app-error-banner [error]="error()" title="Could not load deliveries" />

      <div class="card bg-base-200 border border-base-300">
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Order ID</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Scheduled At</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="6" class="text-center py-8 text-base-content/60">
                    <span class="loading loading-spinner loading-sm"></span>
                    Loading…
                  </td>
                </tr>
              } @else if (sorted().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-8 text-base-content/60">No deliveries yet</td>
                </tr>
              } @else {
                @for (d of sorted(); track d.id) {
                  <tr>
                    <td class="font-mono text-xs">{{ d.id }}</td>
                    <td class="font-mono text-xs">{{ d.orderId }}</td>
                    <td>{{ d.productId }}</td>
                    <td>{{ d.quantity }}</td>
                    <td><app-status-badge [status]="d.status" type="delivery" /></td>
                    <td class="text-xs text-base-content/60">{{ formatDate(d.scheduledAt) }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DeliveriesComponent {
  private deliveryService = inject(DeliveryService);
  private destroyRef = inject(DestroyRef);

  items = signal<Delivery[]>([]);
  loading = signal(true);
  error = signal<unknown>(null);

  sorted = computed(() =>
    [...this.items()].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  );

  constructor() {
    interval(5000).pipe(
      startWith(0),
      switchMap(() =>
        this.deliveryService.getDeliveries().pipe(
          catchError(err => {
            this.error.set(err);
            return EMPTY;
          })
        )
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => {
      this.items.set(data);
      this.loading.set(false);
      this.error.set(null);
    });
  }

  formatDate(ts: string | undefined): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString();
  }
}
