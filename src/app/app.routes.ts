// import { Routes } from '@angular/router';

// export const routes: Routes = [];




// import { Routes } from '@angular/router';

// import { Home } from './features/home/home';
// import { AdminLogin } from './admin/login/admin-login';
// import { AdminDashboard } from './admin/dashboard/admin-dashboard';
// import { adminGuard } from './core/auth/admin.guard';

// export const routes: Routes = [
//   {
//     path: '',
//     component: Home
//   },
//   {
//     path: 'admin/login',
//     component: AdminLogin
//   },
//   {
//     path: 'admin',
//     component: AdminDashboard,
//     canActivate: [adminGuard]
//   },
//   {
//     path: '**',
//     redirectTo: ''
//   }
// ];




// import { Routes } from '@angular/router';

// import { Home } from './features/home/home';
// import { AdminLogin } from './admin/login/admin-login';
// import { AdminDashboard } from './admin/dashboard/admin-dashboard';
// import { adminGuard } from './core/auth/admin.guard';

// export const routes: Routes = [
//   { path: '', component: Home },
//   { path: 'admin/login', component: AdminLogin },
//   {
//     path: 'admin',
//     component: AdminDashboard,
//     canActivate: [adminGuard]
//   },
//   { path: '**', redirectTo: '' }
// ];


import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Cart } from './features/cart/cart';
import { Checkout } from './features/checkout/checkout';
import { OrderConfirmation } from './features/order-confirmation/order-confirmation';

import { AdminLogin } from './admin/login/admin-login';
import { AdminDashboard } from './admin/dashboard/admin-dashboard';
import { AdminOrders } from './admin/orders/admin-orders';

import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'cart',
    component: Cart
  },
  {
    path: 'checkout',
    component: Checkout
  },
  {
    path: 'order-confirmation',
    component: OrderConfirmation
  },
  {
    path: 'admin/login',
    component: AdminLogin
  },
  {
    path: 'admin/orders',
    component: AdminOrders,
    canActivate: [adminGuard]
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
