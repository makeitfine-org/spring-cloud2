import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrdersComponent } from './orders.component';
import { Order } from '../../shared/models/types';

const MOCK_ORDERS: Order[] = [
  { id: 1, productId: 'prod-1', quantity: 2, price: 9.99, status: 'CONFIRMED', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, productId: 'prod-2', quantity: 1, price: 4.99, status: 'PENDING', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
];

describe('OrdersComponent', () => {
  let fixture: ComponentFixture<OrdersComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    httpMock.expectOne('/api/orders').flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display order rows', async () => {
    httpMock.expectOne('/api/orders').flush(MOCK_ORDERS);
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should show dialog when Create Order is clicked', async () => {
    httpMock.expectOne('/api/orders').flush([]);
    await fixture.whenStable();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-primary');
    btn.click();
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('app-create-order-dialog');
    expect(dialog).not.toBeNull();
  });

  it('should expand row and fetch delivery on click', async () => {
    httpMock.expectOne('/api/orders').flush(MOCK_ORDERS);
    await fixture.whenStable();
    // Rows are sorted by createdAt desc: id=2 first, id=1 second
    const firstRow: HTMLTableRowElement = fixture.nativeElement.querySelectorAll('tbody tr')[0];
    firstRow.click();
    const req = httpMock.expectOne('/api/deliveries/order/2');
    req.flush({ id: 10, orderId: 2, productId: 'prod-2', quantity: 1, status: 'SCHEDULED', scheduledAt: '' });
    await fixture.whenStable();
    expect(fixture.componentInstance.expandedId()).toBe(2);
  });
});
