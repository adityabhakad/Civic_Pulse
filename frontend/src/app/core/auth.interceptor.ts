import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;
  const isAuthRequest = request.url.includes('/api/auth/login') || request.url.includes('/api/auth/register');
  const authorizedRequest = token && !isAuthRequest ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(authorizedRequest).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && token && !isAuthRequest) {
      auth.logout();
      void router.navigateByUrl('/login?reason=session-expired');
    }
    return throwError(() => error);
  }));
};
