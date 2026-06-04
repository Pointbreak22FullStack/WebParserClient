import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import {Observable, Subject, tap} from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private oauth = inject(OAuthService);
  private manualAccessToken: string | null = null;
// Только настройка (вызываем в App)
  configureOnly(): void {
    this.configureOAuth();
  }
  // 2. Только попытка логина (обработка кода из URL)
  async tryLogin(): Promise<boolean> {
    return await this.oauth.loadDiscoveryDocumentAndTryLogin();
  }

  // Настройка + попытка логина (для обычных страниц)
  async initOAuth(): Promise<void> {
    this.configureOAuth();
    await this.oauth.loadDiscoveryDocumentAndTryLogin();
  }

  private configureOAuth(): void {
    const base = environment.production ? '' : window.location.origin;
    const authConfig: AuthConfig = {
      issuer: environment.identityIssuer,
      redirectUri: environment.production ? environment.redirectUri : `${window.location.origin}/auth/callback`,
      clientId: 'angular_spa',
      responseType: 'code',
      scope: 'openid profile email roles resource_api',
      showDebugInformation: !environment.production,
      requireHttps: environment.production,
      skipIssuerCheck: !environment.production,
      useSilentRefresh: true, // Включаем авто-обновление токенов
      // ДОБАВЬ ЭТУ СТРОКУ:
      strictDiscoveryDocumentValidation: false,
      clearHashAfterLogin: false,

      loginUrl:      environment.production ? undefined : `${base}/identity/connect/authorize`,
      tokenEndpoint: environment.production ? undefined : `${base}/identity/connect/token`,
      logoutUrl:     environment.production ? undefined : `${base}/identity/connect/logout`,


    };
    this.oauth.configure(authConfig);
    this.oauth.setupAutomaticSilentRefresh();
  }
  /** Запускает Authorization Code Flow + PKCE */

  loginOAuth(): void {
    this.oauth.initCodeFlow();
  }

  logout() {
    this.manualAccessToken = null;
    this.oauth.logOut();
  }
  getAccessToken(): string {
    // Приоритет нашей переменной, если она есть
    return this.manualAccessToken ?? this.oauth.getAccessToken();
  }
  getIdentityClaims(): any {
    return this.oauth.getIdentityClaims();
  }
  isAuthenticated(): boolean {
    return !!this.manualAccessToken || this.oauth.hasValidAccessToken();
  }


  /** Регистрация через API */
  // Регистрация идет в Identity проект (5001)
  register(email: string, password: string, name: string): Observable<any> {
    // Используем identityUrl
    const url = `${environment.identityUrl}/account/register`;
    return this.http.post(url, { email, password, name });
  }

  // Логин тоже в Identity проект (5001)
  loginApi(email: string, password: string): Observable<any> {
    const url = `${environment.identityUrl}/account/login`;
    return this.http.post<any>(url, { login: email, password }, { withCredentials: true });
  }

  // В AuthService.ts
  loginWithCredentials(email: string, password: string): Observable<any> {
    const url = `${environment.identityUrl}/connect/token`;

    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', email);
    body.set('password', password);
    body.set('scope', 'openid profile email roles resource_api');
    body.set('client_id', 'angular_spa');

    return this.http.post<any>(url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(tokens => {
        this.manualAccessToken = tokens.access_token;
        // ✅ Просто сохраняем — никаких лишних вызовов OAuthService
        sessionStorage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
          sessionStorage.setItem('refresh_token', tokens.refresh_token);
        }
        if (tokens.id_token) {
          sessionStorage.setItem('id_token', tokens.id_token);
        }
      })
    );
  }


  getUserId(): string {
    const claims = this.getIdentityClaims();
    if (claims?.sub) return claims.sub as string;
    const token = this.getAccessToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? '';
    } catch {
      return '';
    }
  }

  get oauthEvents$() {
    return this.oauth.events;
  }
}
