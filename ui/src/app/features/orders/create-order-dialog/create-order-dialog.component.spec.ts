import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateOrderDialogComponent } from './create-order-dialog.component';
import { Order } from '../../../shared/models/types';

describe('CreateOrderDialogComponent', () => {
  let fixture: ComponentFixture<CreateOrderDialogComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrderDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrderDialogComponent);
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show dialog with form fields', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(3);
  });

  it('should emit closed when cancel is clicked', () => {
    let emitted = false;
    fixture.componentInstance.closed.subscribe(() => { emitted = true; });
    const cancelBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-ghost');
    cancelBtn.click();
    expect(emitted).toBe(true);
  });

  it('should POST order on valid submit', async () => {
    const comp = fixture.componentInstance;
    comp.form.setValue({ productId: 'prod-1', quantity: 2, price: 9.99 });
    await fixture.whenStable();

    let createdEmitted = false;
    comp.created.subscribe(() => { createdEmitted = true; });

    const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[type="submit"]');
    submitBtn.click();

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('POST');
    const mockOrder: Order = { id: 1, productId: 'prod-1', quantity: 2, price: 9.99, status: 'PENDING', createdAt: '', updatedAt: '' };
    req.flush(mockOrder);
    await fixture.whenStable();

    expect(createdEmitted).toBe(true);
  });
});
