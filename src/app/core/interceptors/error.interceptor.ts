import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

const AUTH_ENDPOINTS = ['/connect/', '/identity/', '/.well-known/'];

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some(e => url.includes(e));
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast  = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Auth/identity endpoints handle errors locally (login/register pages)
      if (isAuthEndpoint(req.url)) {
        return throwError(() => err);
      }

      switch (true) {
        case err.status === 0:
          toast.error('Сервер недоступен. Проверьте подключение.');
          break;
        case err.status === 401:
          toast.warning('Сессия истекла. Войдите снова.');
          router.navigate(['/login']);
          break;
        case err.status === 403:
          toast.error('Нет доступа к этому ресурсу');
          break;
        case err.status === 404:
          // 404 usually handled in component, skip global toast
          break;
        case err.status >= 500:
          toast.error('Ошибка сервера. Попробуйте позже.');
          break;
      }

      return throwError(() => err);
    })
  );
};
