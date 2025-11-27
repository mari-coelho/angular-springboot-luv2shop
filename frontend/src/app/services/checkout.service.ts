import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { PaymentInfo } from '../common/payment-info';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private purchaseUrl = '/api/checkout/purchase';

  private paymentIntentUrl = '/api/checkout/payment-intent';

  constructor(private httpClient: HttpClient) {}

  placeOrder(purchase: Purchase) {
    return this.httpClient.post(this.purchaseUrl, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }
}

