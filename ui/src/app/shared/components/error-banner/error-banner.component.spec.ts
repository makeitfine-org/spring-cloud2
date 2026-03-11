import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ErrorBannerComponent } from './error-banner.component';

describe('ErrorBannerComponent', () => {
  let fixture: ComponentFixture<ErrorBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBannerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBannerComponent);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render nothing when error is null', async () => {
    fixture.componentRef.setInput('error', null);
    await fixture.whenStable();
    const alert = fixture.nativeElement.querySelector('.alert');
    expect(alert).toBeNull();
  });

  it('should render alert when error is set', async () => {
    fixture.componentRef.setInput('error', { message: 'Not found' });
    await fixture.whenStable();
    const alert = fixture.nativeElement.querySelector('.alert');
    expect(alert).not.toBeNull();
  });

  it('should display the title', async () => {
    fixture.componentRef.setInput('error', { message: 'Server error' });
    fixture.componentRef.setInput('title', 'Could not load orders');
    await fixture.whenStable();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Could not load orders');
  });

  it('should extract message from error.error.message', async () => {
    fixture.componentRef.setInput('error', { error: { message: 'Nested message' } });
    await fixture.whenStable();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Nested message');
  });

  it('should fall back to generic message for unrecognized error shape', async () => {
    fixture.componentRef.setInput('error', { unknown: true });
    await fixture.whenStable();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('An unexpected error occurred.');
  });
});
