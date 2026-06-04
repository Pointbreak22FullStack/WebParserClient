import {Component, computed, inject, signal} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {Sidebar} from './components/sidebar/sidebar';
import {Header} from './components/header/header';
import {ToastComponent} from './components/toast/toast.component';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs';
import {AuthService} from './services/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('web-parser-client');
  private router = inject(Router);
  private authService = inject(AuthService);

  async ngOnInit() {
    // Сначала всегда конфигурируем библиотеку
    this.authService.configureOnly();

    // Пытаемся обработать логин (токены из хранилища)
    // ТОЛЬКО если мы не на странице колбэка.
    // Это предотвращает ту самую "гонку", когда два компонента едят один и тот же 'code'
    if (!window.location.pathname.includes('/auth/callback')) {
      await this.authService.tryLogin();
    }
  }


  // Создаем сигнал, который следит за текущим URL
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => event.urlAfterRedirects)
    )
  );

  // Теперь скрываем Header и Sidebar для /login и для /register
  isAuthPage = computed(() => {
    const url = this.currentUrl();
    return ['/login', '/register'].some(path => url?.includes(path));
  });

}
