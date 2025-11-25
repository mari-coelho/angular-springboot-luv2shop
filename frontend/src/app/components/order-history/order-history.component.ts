import { Component, OnInit } from '@angular/core';
import { OrderHistory } from '../../common/order-history';
import { OrderHistoryService } from '../../services/order-history.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {

  orderHistoryList: OrderHistory[] = [];
  storage: Storage = sessionStorage;


  constructor(private orderHistoryService: OrderHistoryService) { }

  ngOnInit(): void {
    this.handleOrderHistory();
  }


  handleOrderHistory() {
    //read the user´s email address from browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    //retrieve data from the service
    this.orderHistoryService.getOrderHistory(theEmail).subscribe(
      data => {
        console.log('Primeiro pedido:', data._embedded.orders[0]);
        this.orderHistoryList = data._embedded.orders;
      }
    );
  }

}
