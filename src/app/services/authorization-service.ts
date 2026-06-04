import {
  Injectable,
  inject,
  PLATFORM_ID,
  computed,
  signal,
  Signal, REQUEST
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import {OAuthService} from 'angular-oauth2-oidc';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private oauthService = inject(OAuthService);
  private auth = inject(AuthService);
  // private platformId = inject(PLATFORM_ID);
  // public readonly isBrowser = isPlatformBrowser(this.platformId);
  // private request = inject(REQUEST, { optional: true }); // Доступно только в SSR

  /**
   * Ручной триггер для обновления состояния
   */
  private manualUpdate = signal(Date.now());

  /**
   * Реакция на события OAuth (SSR-safe)
   */
  private oauthEvent: Signal<number>;

  constructor() {
    if (this.auth.oauthEvents$) {
      this.oauthEvent = toSignal(
        this.auth.oauthEvents$.pipe(
          map(() => Date.now()),
          startWith(Date.now())
        ),
        { initialValue: Date.now() }
      );
    } else {
      this.oauthEvent = signal(Date.now());
    }
  }
  /**
   * Общий триггер
   */
  private trigger = computed(() => {
    return this.oauthEvent() + this.manualUpdate();
  });


  /**
   * Claims пользователя
   */
    // Сигнал, который пересчитывается при изменениях
  readonly claims = computed(() => {
    this.manualUpdate();
    return this.auth.isAuthenticated() ? this.auth.getIdentityClaims() : null;
  });

  /**
   * Статус авторизации
   */

  readonly isAuthenticated = computed(() => !!this.claims());



  /**
   * Роли пользователя (case-insensitive)
   */
  readonly userRoles = computed<string[]>(() => {
    const claims = this.claims();
    if (!claims) return [];
    const roles = claims['role'] ?? claims['roles'] ??
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return Array.isArray(roles) ? roles : (roles ? [roles] : []);
  });



  /**
   * Проверка роли (без учета регистра)
   */
  hasRole(role: string): boolean {
    return this.userRoles().some(r => r.toLowerCase() === role.toLowerCase());
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    const claims = this.oauthService.getIdentityClaims() as any;
    if (!claims || !claims.roles) return false;

    const userRoles = Array.isArray(claims.roles) ? claims.roles : [claims.roles];
    return requiredRoles.some(role => userRoles.includes(role));
  }

  private safeDecode(token: string) {
    try { return jwtDecode<Record<string, any>>(token); }
    catch { return null; }
  }

  private getCookieValue(cookieString: string, name: string): string | null {
    const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
  /**
   * Принудительное обновление
   */
  refreshState(): void {
    this.manualUpdate.set(Date.now());
  }
}
