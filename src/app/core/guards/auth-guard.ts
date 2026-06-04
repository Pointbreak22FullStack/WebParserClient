import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {AuthorizationService} from '../../services/authorization-service';
import {AuthService} from '../../services/auth-service';
import {OAuthService} from 'angular-oauth2-oidc';


export const authGuard: CanActivateFn = (route, state) => { // Добавь аргументы
  const oauthService = inject(OAuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  // 1. Если мы УЖЕ идем на страницу колбэка, не мешаем
  if (state.url.includes('/auth/callback')) {
    return true;
  }

  // 2. Если токен валиден — пускаем
  if (oauthService.hasValidAccessToken()) {
    return true;
  }

  // 3. Проверяем наличие кода в URL (предотвращает редирект на логин при возврате с сервера)
  const params = new URLSearchParams(window.location.search);
  if (params.has('code')) {
    return true;
  }

  // Если ничего не подошло — на логин
  return router.createUrlTree(['/login']);
};
