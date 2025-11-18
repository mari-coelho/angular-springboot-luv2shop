import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ProductCategoryMenu } from './components/product-category-menu/product-category-menu';
import { Search } from './components/search/search';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductList } from './components/product-list/product-list';

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
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  title = 'angular-ecommerce';
}
