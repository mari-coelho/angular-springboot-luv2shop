import { Injectable } from '@angular/core';
import { OrderHistory } from '../common/order-history';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private orderUrl = environment.apiUrl + '/orders';

  constructor(private httpClient: HttpClient) {}

  getOrderHistory(theEmail: string): Observable<GetResponseOrderHistory> {
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}`;

    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);
  }
}

interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[];
  };
}
