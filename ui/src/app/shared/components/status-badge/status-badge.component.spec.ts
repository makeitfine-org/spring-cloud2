import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  it('should create', () => {
    fixture.componentRef.setInput('status', 'PENDING');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should apply badge-warning for PENDING order status', async () => {
    fixture.componentRef.setInput('status', 'PENDING');
    await fixture.whenStable();
    const badge: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('badge-warning');
  });

  it('should apply badge-success for CONFIRMED order status', async () => {
    fixture.componentRef.setInput('status', 'CONFIRMED');
    await fixture.whenStable();
    const badge: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('badge-success');
  });

  it('should apply badge-error for CANCELLED order status', async () => {
    fixture.componentRef.setInput('status', 'CANCELLED');
    await fixture.whenStable();
    const badge: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('badge-error');
  });

  it('should apply badge-secondary for SCHEDULED delivery status', async () => {
    fixture.componentRef.setInput('status', 'SCHEDULED');
    fixture.componentRef.setInput('type', 'delivery');
    await fixture.whenStable();
    const badge: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('badge-secondary');
  });

  it('should fall back to badge-neutral for unknown status', async () => {
    fixture.componentRef.setInput('status', 'UNKNOWN');
    await fixture.whenStable();
    const badge: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('badge-neutral');
  });
});
