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




import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { AdminLogin } from './admin/login/admin-login';
import { AdminDashboard } from './admin/dashboard/admin-dashboard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin/login', component: AdminLogin },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];
