import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth-service';
import { AuthorizationService } from '../../services/authorization-service';
import { getHttpErrorMessage } from '../../core/utils/http-error.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService  = inject(AuthService);
  private authzService = inject(AuthorizationService);

  registerData = { name: '', email: '', password: '', confirmPassword: '' };
  showPassword = signal(false);
  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);

  protected togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  protected onRegister(): void {
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      this.errorMessage.set('Заполните все поля, включая имя');
      return;
    }
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage.set('Пароли не совпадают');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerData.email, this.registerData.password, this.registerData.name)
      .subscribe({
        next: () => {
          this.authService.loginWithCredentials(this.registerData.email, this.registerData.password)
            .subscribe({
              next: () => {
                this.authzService.refreshState();
                window.location.href = '/';
              },
              error: (err: HttpErrorResponse) => {
                this.isLoading.set(false);
                this.errorMessage.set('Аккаунт создан, но войти автоматически не удалось. ' + getHttpErrorMessage(err));
              },
            });
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.resolveRegisterError(err));
        },
      });
  }

  private resolveRegisterError(err: HttpErrorResponse): string {
    if (err.status === 0)  return 'Сервер недоступен. Проверьте подключение.';
    if (err.status === 400) return err.error?.message || 'Проверьте правильность данных';
    if (err.status === 409) return 'Пользователь с таким email уже существует';
    return getHttpErrorMessage(err);
  }
}
