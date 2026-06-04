import {OAuthService} from 'angular-oauth2-oidc';
import {Component, computed, inject, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {AuthorizationService} from '../../services/authorization-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.html',
  styleUrls: ['./callback.css'], // было styleUrl → должно быть styleUrls
})
export class Callback implements OnInit {
  private router = inject(Router);
  private oauth = inject(OAuthService);
  private authService = inject(AuthorizationService);
  // private platformId = inject(PLATFORM_ID);

  // Используем сигнал из сервиса
  isAdmin = computed(() => this.authService.hasRole("Admin"));

  async ngOnInit() {
    try {
      // ✅ Конфиг уже применён в app init — просто обрабатываем code из URL
      const success = await this.oauth.tryLogin();

      if (success && this.oauth.hasValidAccessToken()) {
        this.authService.refreshState();
        await this.router.navigate(['/'], { replaceUrl: true });
      } else {
        await this.router.navigate(['/login']);
      }
    } catch (err) {
      console.error('Callback error:', err);
      await this.router.navigate(['/login']);
    }
  }

}
