import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Если получили 401, значит нужен логин.
        // Можно либо просто скрыть функции, либо отправить на страницу входа.
        console.warn('Доступ запрещен. Нужна авторизация.');
        // router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
