import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth-service';

const AUTH_ENDPOINTS = ['/connect/', '/identity/', '/.well-known/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId   = inject(PLATFORM_ID);
  const authService  = inject(AuthService);

  if (!isPlatformBrowser(platformId)) return next(req);

  const isAuthEndpoint = AUTH_ENDPOINTS.some(e => req.url.includes(e));
  const token = authService.getAccessToken();

  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        // Очищаем токены локально, без редиректа на Identity (это делает error.interceptor)
        authService.clearTokens();
      }
      return throwError(() => error);
    })
  );
};
