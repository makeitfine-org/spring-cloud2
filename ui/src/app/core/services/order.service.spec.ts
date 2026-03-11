import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { OrderService } from './order.service';
import { Order, CreateOrderRequest } from '../../shared/models/types';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET /api/orders', () => {
    const mockOrders: Order[] = [
      { id: 1, productId: 'prod-1', quantity: 2, price: 10, status: 'PENDING', createdAt: '', updatedAt: '' },
    ];
    service.getOrders().subscribe(orders => {
      expect(orders).toEqual(mockOrders);
    });
    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should POST /api/orders', () => {
    const payload: CreateOrderRequest = { productId: 'prod-1', quantity: 2, price: 9.99 };
    const mockOrder: Order = { id: 1, ...payload, status: 'PENDING', createdAt: '', updatedAt: '' };
    service.createOrder(payload).subscribe(order => {
      expect(order).toEqual(mockOrder);
    });
    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockOrder);
  });
});
