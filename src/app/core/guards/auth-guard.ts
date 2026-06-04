import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const platformId  = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  if (state.url.includes('/auth/callback')) return true;

  // Проверяем OAuth code в URL (возврат с Identity Server)
  if (new URLSearchParams(window.location.search).has('code')) return true;

  if (authService.isAuthenticated()) return true;

  return router.createUrlTree(['/login']);
};
