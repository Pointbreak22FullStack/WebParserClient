import {Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {OverlayModule} from '@angular/cdk/overlay';
import {AuthorizationService} from '../../services/authorization-service';
import {AuthService} from '../../services/auth-service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, OverlayModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
// Данные обернуты в Signal для высокой производительности Angular 21
  private authz = inject(AuthorizationService);
  private router = inject(Router);
  private authService = inject(AuthService);

  isProfileOpen = signal(false);

  // Получаем данные пользователя из claims
  // В OpenID Connect имя обычно в 'name', а почта в 'email'
  user = computed(() => {
    const claims = this.authz.claims();
    if (!claims) return null;

    return {
      name: claims['name'] || claims['preferred_username'] || 'Пользователь',
      email: claims['email'] ||
        // claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        'no-email@auto.panel'
    };

  });


  toggleProfile() {
    this.isProfileOpen.update(v => !v);
  }

  // Метод для выхода
  logout() {
    this.authz.refreshState();
    // 1. Вызываем реальный логаут из сервиса
    this.authService.logout();

    // 2. Закрываем выпадающее меню
    this.isProfileOpen.set(false);

    // 3. Опционально: редирект на главную/логин
    this.router.navigate(['/login']);
  }
  sections = signal<NavSection[]>([
    {
      title: 'Обзор',
      items: [
        { label: 'Dashboard', icon: 'pi pi-objects-column', route: '' }
      ]
    },
    {
      title: 'Задачи',
      items: [
        { label: 'Все задачи', icon: 'pi pi-briefcase', route: '/tasks' },
        { label: 'Новая задача', icon: 'pi pi-plus-circle', route: '/new-task' }
      ]
    },
    {
      title: 'Инструменты',
      items: [
        { label: 'Комментарии', icon: 'pi pi-comments', route: '/comments' },
        { label: 'Лайки / Дизлайки', icon: 'pi pi-thumbs-up', route: '/like-booster' },
        { label: 'Мониторинг позиций', icon: 'pi pi-compass', route: '/monitoring' },
        { label: 'Генерация AI', icon: 'pi pi-sparkles', route: '/gen-ai' }
      ]
    },
    {
      title: 'Система',
      items: [
        { label: 'Аккаунты', icon: 'pi pi-users', route: '/accounts' },
        { label: 'Прокси', icon: 'pi pi-globe', route: '/proxies' },
        { label: 'Логи', icon: 'pi pi-file', route: '/logs' },
        { label: 'Настройки', icon: 'pi pi-wrench', route: '/settings' }
      ]
    }
  ]);
}
