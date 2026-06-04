import {Component, inject, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../services/auth-service';
import {FormGroup, FormsModule} from '@angular/forms';
import {AuthorizationService} from '../../services/authorization-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit  {

  private authService = inject(AuthService);
  private authzService = inject(AuthorizationService); // ✅ добавить
  private router=inject(Router);
  private route = inject(ActivatedRoute); // ✅ добавить
  private returnUrl: string | null = null;
  loginData = {
    email: '',
    password: ''
  };

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  showPassword = signal(false);
  ngOnInit() {
    // ✅ Запоминаем returnUrl от Identity Server
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }
  protected togglePassword() {
    this.showPassword.update(v => !v);
  }

  protected onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage.set('Пожалуйста, заполните все поля');
      return;
    }
    this.errorMessage.set(null);
    this.isLoading.set(true);

    if (this.returnUrl) {
      // ✅ Пришли через OAuth2 flow — нужна кука для authorize endpoint
      this.authService.loginApi(this.loginData.email, this.loginData.password).subscribe({
        next: () => {
          // Кука установлена — возвращаем браузер на authorize endpoint
          window.location.href = this.returnUrl!;
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Неверный логин или пароль');
        }
      });
    } else {
      // ✅ Прямой вход — нужен JWT token сразу
      this.authService.loginWithCredentials(this.loginData.email, this.loginData.password).subscribe({
        next: () => {
          this.authzService.refreshState();
          this.router.navigate(['/']);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Неверный логин или пароль');
        }
      });
    }
  }
    // this.authService.loginApi(this.loginData.email, this.loginData.password).subscribe({
    //   next: () => {
    //     // API поставило куку, теперь просим OAuthService начать поток
    //     // Важно: redirectUri в конфиге должен быть именно http://localhost:4200/auth/callback
    //     this.authService.loginOAuth();
    //   },
    //   error: (err) => {
    //     this.isLoading.set(false);
    //     this.errorMessage.set('Неверный логин или пароль');
    //   }
    // });



}
