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
  private manualAccessToken: string | null =
    sessionStorage.getItem('access_token');
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

      loginUrl:              environment.production ? undefined : `${base}/identity/connect/authorize`,
      tokenEndpoint:         environment.production ? undefined : `${base}/identity/connect/token`,
      logoutUrl:             environment.production ? undefined : `${base}/identity/connect/logout`,
      postLogoutRedirectUri: environment.production ? undefined : `${base}/login`,


    };
    this.oauth.configure(authConfig);
    this.oauth.setupAutomaticSilentRefresh();
  }
  /** Запускает Authorization Code Flow + PKCE */

  loginOAuth(): void {
    this.oauth.initCodeFlow();
  }

  logout(): void {
    this.clearTokens();
    this.oauth.logOut();
  }

  clearTokens(): void {
    this.manualAccessToken = null;
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('id_token');
  }
  getAccessToken(): string {
    // Приоритет нашей переменной, если она есть
    return this.manualAccessToken ?? this.oauth.getAccessToken();
  }
  getIdentityClaims(): any {
    return this.oauth.getIdentityClaims();
  }
  isAuthenticated(): boolean {
    if (this.manualAccessToken) {
      if (this.isTokenExpired(this.manualAccessToken)) {
        this.clearTokens();
        return false;
      }
      return true;
    }
    return this.oauth.hasValidAccessToken();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 < Date.now() : false;
    } catch {
      return true;
    }
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
