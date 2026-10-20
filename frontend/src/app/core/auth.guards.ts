import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const citizenGuard: CanActivateFn = () => {
  const auth = inject(AuthService); const router = inject(Router); const user = auth.user();
  if (user?.role === 'CITIZEN') return true;
  return router.createUrlTree([user?.role === 'ADMIN' ? '/admin' : '/login']);
};
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService); const router = inject(Router); const user = auth.user();
  if (user?.role === 'ADMIN') return true;
  return router.createUrlTree([user?.role === 'CITIZEN' ? '/citizen' : '/login']);
};
