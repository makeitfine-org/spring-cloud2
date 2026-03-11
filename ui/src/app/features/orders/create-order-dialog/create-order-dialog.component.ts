import { Component, ChangeDetectionStrategy, inject, output, signal, viewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-create-order-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorBannerComponent],
  template: `
    <dialog #dialogEl class="modal modal-open">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">Create Order</h3>

        <app-error-banner [error]="submitError()" title="Failed to create order" />

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="label">
              <span class="label-text">Product ID</span>
            </label>
            <input
              formControlName="productId"
              type="text"
              placeholder="e.g. prod-1"
              class="input w-full"
              [class.input-error]="isInvalid('productId')"
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text">Quantity</span>
            </label>
            <input
              formControlName="quantity"
              type="number"
              min="1"
              placeholder="e.g. 5"
              class="input w-full"
              [class.input-error]="isInvalid('quantity')"
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text">Price</span>
            </label>
            <input
              formControlName="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 29.99"
              class="input w-full"
              [class.input-error]="isInvalid('price')"
            />
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" (click)="onCancel()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              @if (submitting()) {
                <span class="loading loading-spinner loading-sm"></span>
                Creating…
              } @else {
                Create Order
              }
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" (click)="onCancel()">
        <button type="button">close</button>
      </form>
    </dialog>
  `,
})
export class CreateOrderDialogComponent {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  closed = output<void>();
  created = output<void>();

  submitting = signal(false);
  submitError = signal<unknown>(null);

  form = this.fb.group({
    productId: ['', [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    price: [0.01, [Validators.required, Validators.min(0)]],
  });

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    const { productId, quantity, price } = this.form.getRawValue();
    this.orderService.createOrder({
      productId: productId!,
      quantity: Number(quantity),
      price: Number(price),
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.created.emit();
        this.closed.emit();
      },
      error: err => {
        this.submitting.set(false);
        this.submitError.set(err);
      },
    });
  }

  onCancel(): void {
    this.closed.emit();
  }
}
