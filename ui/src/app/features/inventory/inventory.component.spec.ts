import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { InventoryComponent } from './inventory.component';

describe('InventoryComponent', () => {
  let fixture: ComponentFixture<InventoryComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    httpMock.expectOne('/api/inventory').flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display inventory rows', async () => {
    const req = httpMock.expectOne('/api/inventory');
    req.flush([
      { productId: 'prod-1', quantity: 100, reservedQuantity: 10, availableQuantity: 90 },
    ]);
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('prod-1');
  });
});
