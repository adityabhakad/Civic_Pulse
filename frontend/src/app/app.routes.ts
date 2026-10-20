import { Routes } from '@angular/router';
import { citizenGuard, adminGuard } from './core/auth.guards';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home-page').then(m => m.HomePage) },
  { path: 'login', data: { mode: 'login' }, loadComponent: () => import('./auth/auth-page').then(m => m.AuthPage) },
  { path: 'register', data: { mode: 'register' }, loadComponent: () => import('./auth/auth-page').then(m => m.AuthPage) },
  { path: 'citizen', canActivate: [citizenGuard], loadComponent: () => import('./pages/citizen-page').then(m => m.CitizenPage) },
  { path: 'citizen/complaints', canActivate: [citizenGuard], loadComponent: () => import('./pages/complaint-management-page').then(m => m.ComplaintManagementPage) },
  { path: 'citizen/complaints/new', canActivate: [citizenGuard], loadComponent: () => import('./pages/citizen-complaint-page').then(m => m.CitizenComplaintPage) },
  { path: 'citizen/complaints/:id', canActivate: [citizenGuard], loadComponent: () => import('./pages/citizen-complaint-page').then(m => m.CitizenComplaintPage) },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./pages/admin-page').then(m => m.AdminPage) },
  { path: 'admin/complaints', canActivate: [adminGuard], loadComponent: () => import('./pages/complaint-management-page').then(m => m.ComplaintManagementPage) },
  { path: 'admin/complaints/:id', canActivate: [adminGuard], loadComponent: () => import('./pages/admin-complaint-details-page').then(m => m.AdminComplaintDetailsPage) },
  { path: '**', redirectTo: '' }
];
