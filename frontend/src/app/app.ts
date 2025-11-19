import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ProductCategoryMenu } from './components/product-category-menu/product-category-menu';
import { Search } from './components/search/search';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductList } from './components/product-list/product-list';
import { CartStatus } from './components/cart-status/cart-status';
import { CartDetails } from './components/cart-details/cart-details';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ProductList,
    RouterOutlet,
    RouterModule,
    ProductCategoryMenu,
    Search,
    NgbPaginationModule,
    CartStatus,
    CartDetails,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  title = 'angular-ecommerce';
}
