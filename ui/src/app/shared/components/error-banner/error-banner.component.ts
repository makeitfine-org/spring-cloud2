import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message()) {
      <div class="alert alert-error mb-4" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
        </svg>
        <div>
          <span class="font-medium">{{ title() }}</span>
          <span class="block text-sm">{{ message() }}</span>
        </div>
      </div>
    }
  `,
})
export class ErrorBannerComponent {
  error = input<unknown>(null);
  title = input<string>('Error');

  message = computed(() => {
    const err = this.error();
    if (!err) return null;
    const e = err as { error?: { message?: string }; message?: string; statusText?: string };
    return e?.error?.message ?? e?.message ?? e?.statusText ?? 'An unexpected error occurred.';
  });
}
