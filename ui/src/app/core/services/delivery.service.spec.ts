import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { DeliveryService } from './delivery.service';
import { Delivery } from '../../shared/models/types';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET /api/deliveries', () => {
    const mockDeliveries: Delivery[] = [
      { id: 1, orderId: 1, productId: 'prod-1', quantity: 2, status: 'SCHEDULED', scheduledAt: '' },
    ];
    service.getDeliveries().subscribe(deliveries => {
      expect(deliveries).toEqual(mockDeliveries);
    });
    const req = httpMock.expectOne('/api/deliveries');
    expect(req.request.method).toBe('GET');
    req.flush(mockDeliveries);
  });

  it('should GET /api/deliveries/order/:orderId', () => {
    const mockDelivery: Delivery = { id: 1, orderId: 1, productId: 'prod-1', quantity: 2, status: 'SCHEDULED', scheduledAt: '' };
    service.getDeliveryByOrderId(1).subscribe(delivery => {
      expect(delivery).toEqual(mockDelivery);
    });
    const req = httpMock.expectOne('/api/deliveries/order/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockDelivery);
  });
});
