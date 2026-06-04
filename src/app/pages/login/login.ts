import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth-service';
import { AuthorizationService } from '../../services/authorization-service';
import { getHttpErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private authService  = inject(AuthService);
  private authzService = inject(AuthorizationService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);
  private returnUrl: string | null = null;

  loginData    = { email: '', password: '' };
  errorMessage = signal<string | null>(null);
  isLoading    = signal(false);
  showPassword = signal(false);

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  protected togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  protected onLogin(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage.set('Пожалуйста, заполните все поля');
      return;
    }
    this.errorMessage.set(null);
    this.isLoading.set(true);

    if (this.returnUrl) {
      this.authService.loginApi(this.loginData.email, this.loginData.password).subscribe({
        next: () => { window.location.href = this.returnUrl!; },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.resolveLoginError(err));
        },
      });
    } else {
      this.authService.loginWithCredentials(this.loginData.email, this.loginData.password).subscribe({
        next: () => {
          this.authzService.refreshState();
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.resolveLoginError(err));
        },
      });
    }
  }

  private resolveLoginError(err: HttpErrorResponse): string {
    if (err.status === 0)   return 'Сервер недоступен. Проверьте подключение.';
    if (err.status === 400 || err.status === 401) return 'Неверный логин или пароль';
    return getHttpErrorMessage(err);
  }
}
