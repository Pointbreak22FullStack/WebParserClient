import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return next(req);

  const token = oauthService.getAccessToken();

  console.log(`[HTTP Request] ${req.method} ${req.url}`);
  console.log(`[Auth Interceptor] Token found: ${!!token}`);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  // Не шлем токен, если это запрос за конфигом или токеном
  const isAuthEndpoint =
    req.url.includes('/connect/') ||
    req.url.includes('/identity/connect/') ||
    req.url.includes('/.well-known/');

  let authReq = req;
  if (token && isApiRequest && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Если API говорит 401, значит токен протух
        oauthService.logOut();
      }
      return throwError(() => error);
    })
  );


  // const platformId = inject(PLATFORM_ID);
  //
  // /**
  //  * SSR — ничего не делаем
  //  * Важно: НЕ инжектим OAuthService до этой проверки
  //  */
  // if (!isPlatformBrowser(platformId)) {
  //   return next(req);
  // }
  //
  // /**
  //  * Инжектим ТОЛЬКО в браузере
  //  */
  // const oauthService = inject(OAuthService);
  //
  // const token = oauthService.getAccessToken();
  //
  // const isAuthRequest = req.url.includes('/connect/') || req.url.includes('/.well-known/');
  //
  // let authReq = req;
  // if (token && !isAuthRequest) { // Не шлем токен на эндпоинты авторизации самого сервера
  //   authReq = req.clone({
  //     setHeaders: { Authorization: `Bearer ${token}` }
  //   });
  // }
  // return next(authReq).pipe(
  //   catchError((error: HttpErrorResponse) => {
  //     // Вызываем logout только если это был запрос к данным API,
  //     // а не ошибка при попытке авторизоваться
  //     if (error.status === 401 && !isAuthRequest) {
  //       // Вместо жесткого logout лучше просто уведомить систему
  //       // oauthService.logOut();
  //     }
  //     return throwError(() => error);
  //   })
  // );
  // const isAuthenticated = oauthService.hasValidAccessToken();
  //
  // const isApiUrl =
  //   req.url.startsWith(environment.apiUrl) ||
  //   req.url.startsWith('/api');
  //
  // let authReq = req;
  //
  // /**
  //  * Добавляем Authorization header только если:
  //  * - есть токен
  //  * - токен валиден
  //  * - это запрос к API
  //  */
  // if (token && isAuthenticated && isApiUrl) {
  //   authReq = req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   });
  // }
  //
  // return next(authReq).pipe(
  //   catchError((error: HttpErrorResponse) => {
  //
  //     /**
  //      * Если 401 — делаем logout (только в браузере)
  //      */
  //     if (error.status === 401) {
  //       oauthService.logOut();
  //     }
  //
  //     return throwError(() => error);
  //   })
  // );
};
