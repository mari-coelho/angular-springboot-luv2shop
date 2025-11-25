import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { ProductDetails } from './components/product-details/product-details';
import { CartDetails } from './components/cart-details/cart-details';
import { Checkout } from './components/checkout/checkout';
import { AuthGuard } from '@auth0/auth0-angular';
import { MembersPage } from './components/members-page/members-page';
import { OrderHistoryComponent } from './components/order-history/order-history.component';

export const routes: Routes = [
  {
    path: 'order-history',
    component: OrderHistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'members',
    component: MembersPage,
    canActivate: [AuthGuard],
  },
  { path: 'checkout', component: Checkout },
  { path: 'cart-details', component: CartDetails },
  { path: 'products/:id', component: ProductDetails },
  { path: 'search/:keyword', component: ProductList },
  { path: 'category/:id/:name', component: ProductList },
  { path: 'category/:id', component: ProductList },
  { path: 'category', component: ProductList },
  { path: 'products', component: ProductList },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products', pathMatch: 'full' },
];
