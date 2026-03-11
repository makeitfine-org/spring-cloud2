import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    httpMock.expectOne('/api/orders').flush([]);
    httpMock.expectOne('/api/inventory').flush([]);
    httpMock.expectOne('/api/deliveries').flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display stat cards', async () => {
    httpMock.expectOne('/api/orders').flush([
      { id: 1, productId: 'prod-1', quantity: 1, price: 9.99, status: 'CONFIRMED', createdAt: '', updatedAt: '' },
    ]);
    httpMock.expectOne('/api/inventory').flush([
      { productId: 'prod-1', quantity: 100, reservedQuantity: 0, availableQuantity: 100 },
    ]);
    httpMock.expectOne('/api/deliveries').flush([]);
    await fixture.whenStable();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Dashboard');
    expect(text).toContain('Total Orders');
  });
});
