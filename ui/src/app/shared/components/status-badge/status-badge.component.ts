import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

type BadgeType = 'order' | 'delivery';

const ORDER_BADGE: Record<string, string> = {
  PENDING: 'badge badge-warning',
  INVENTORY_RESERVED: 'badge badge-info',
  CONFIRMED: 'badge badge-success',
  CANCELLED: 'badge badge-error',
};

const DELIVERY_BADGE: Record<string, string> = {
  SCHEDULED: 'badge badge-secondary',
  IN_TRANSIT: 'badge badge-info',
  DELIVERED: 'badge badge-success',
  FAILED: 'badge badge-error',
};

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="badgeClass()">{{ status() }}</span>`,
})
export class StatusBadgeComponent {
  status = input.required<string>();
  type = input<BadgeType>('order');

  badgeClass = computed(() => {
    const palette = this.type() === 'delivery' ? DELIVERY_BADGE : ORDER_BADGE;
    return palette[this.status()] ?? 'badge badge-neutral';
  });
}
