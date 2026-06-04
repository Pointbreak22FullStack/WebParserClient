import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {AuthorizationService} from '../../services/authorization-service';


export const roleGuard: CanActivateFn = (route) => {
  const authz = inject(AuthorizationService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!authz.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (authz.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
