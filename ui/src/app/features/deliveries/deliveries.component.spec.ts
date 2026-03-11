import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeliveriesComponent } from './deliveries.component';

describe('DeliveriesComponent', () => {
  let fixture: ComponentFixture<DeliveriesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveriesComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveriesComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    httpMock.expectOne('/api/deliveries').flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display deliveries', async () => {
    httpMock.expectOne('/api/deliveries').flush([
      { id: 1, orderId: 1, productId: 'prod-1', quantity: 2, status: 'SCHEDULED', scheduledAt: '' },
    ]);
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });
});
