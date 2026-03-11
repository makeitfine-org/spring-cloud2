import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InventoryService } from '../../core/services/inventory.service';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { InventoryItem } from '../../shared/models/types';

@Component({
  selector: 'app-inventory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorBannerComponent],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-base-content">Inventory</h1>
        <p class="text-sm text-base-content/60 mt-1">Read-only · stock is managed by the saga</p>
      </div>

      <app-error-banner [error]="error()" title="Could not load inventory" />

      <div class="card bg-base-200 border border-base-300">
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Total Qty</th>
                <th>Reserved</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="4" class="text-center py-8 text-base-content/60">
                    <span class="loading loading-spinner loading-sm"></span>
                    Loading…
                  </td>
                </tr>
              } @else if (items().length === 0) {
                <tr>
                  <td colspan="4" class="text-center py-8 text-base-content/60">No inventory data</td>
                </tr>
              } @else {
                @for (item of items(); track item.productId) {
                  <tr>
                    <td class="font-medium">{{ item.productId }}</td>
                    <td>{{ item.quantity }}</td>
                    <td class="text-base-content/60">{{ item.reservedQuantity }}</td>
                    <td [class]="availableClass(item)">{{ availableQty(item) }}</td>
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
export class InventoryComponent {
  private inventoryService = inject(InventoryService);
  private destroyRef = inject(DestroyRef);

  items = signal<InventoryItem[]>([]);
  loading = signal(true);
  error = signal<unknown>(null);

  constructor() {
    this.inventoryService.getInventory()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.items.set(data); this.loading.set(false); },
        error: err => { this.error.set(err); this.loading.set(false); },
      });
  }

  availableQty(item: InventoryItem): number {
    return item.availableQuantity ?? (item.quantity - (item.reservedQuantity ?? 0));
  }

  availableClass(item: InventoryItem): string {
    return this.availableQty(item) > 0 ? 'text-success font-semibold' : 'text-error font-semibold';
  }
}
