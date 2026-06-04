import {Component, inject, signal} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../services/auth-service';
import {FormsModule} from '@angular/forms';
import {AuthorizationService} from '../../services/authorization-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private authzService = inject(AuthorizationService); // ✅ добавить

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  protected togglePassword() {
    this.showPassword.update(v => !v);
  }

  /** Регистрация через API, затем сразу OAuth2 login */
  protected onRegister() {
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

    // Отправляем данные на сервер
    this.authService.register(
      this.registerData.email,
      this.registerData.password,
      this.registerData.name
    ).subscribe({
      next: () => {
        // РЕГИСТРАЦИЯ УСПЕШНА -> Сразу логинимся через Token Flow
        this.authService.loginWithCredentials(this.registerData.email, this.registerData.password)
          .subscribe({
            next: () => {
              this.authzService.refreshState(); // ✅ добавить

              // Перенаправляем на главную, так как мы теперь авторизованы
              window.location.href = '/';
            },
            error: (err) => {
              this.isLoading.set(false);
              console.error('Token error:', JSON.stringify(err.error)); // ← добавить
              this.errorMessage.set('Аккаунт создан, но войти автоматически не удалось');
            }
          });
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Register error body:', err.error); // ← увидите точную причину
        this.errorMessage.set(err.error?.message || 'Ошибка регистрации');
      }
    });
  }

}
