import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { InventoryService } from './inventory.service';
import { InventoryItem } from '../../shared/models/types';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET /api/inventory', () => {
    const mockItems: InventoryItem[] = [
      { productId: 'prod-1', quantity: 100, reservedQuantity: 10, availableQuantity: 90 },
    ];
    service.getInventory().subscribe(items => {
      expect(items).toEqual(mockItems);
    });
    const req = httpMock.expectOne('/api/inventory');
    expect(req.request.method).toBe('GET');
    req.flush(mockItems);
  });

  it('should GET /api/inventory/:productId', () => {
    const mockItem: InventoryItem = { productId: 'prod-1', quantity: 100, reservedQuantity: 10, availableQuantity: 90 };
    service.getInventoryByProduct('prod-1').subscribe(item => {
      expect(item).toEqual(mockItem);
    });
    const req = httpMock.expectOne('/api/inventory/prod-1');
    expect(req.request.method).toBe('GET');
    req.flush(mockItem);
  });
});
