import {Component, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map, startWith} from 'rxjs';

const PAGE_TITLES: Record<string, { title: string; section: string }> = {
  '':           { title: 'Дашборд',     section: 'Обзор' },
  'tasks':      { title: 'Все задачи',  section: 'Задачи' },
  'new-task':   { title: 'Новая задача', section: 'Задачи' },
  'comments':   { title: 'Комментарии', section: 'Инструменты' },
  'monitoring': { title: 'Мониторинг',  section: 'Инструменты' },
  'gen-ai':     { title: 'Генерация AI', section: 'Инструменты' },
  'accounts':   { title: 'Аккаунты',    section: 'Система' },
  'proxies':    { title: 'Прокси',      section: 'Система' },
  'logs':       { title: 'Логи',        section: 'Система' },
  'settings':   { title: 'Настройки',   section: 'Система' },
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private router = inject(Router);

  private url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly page = computed(() => {
    const segment = (this.url() || '').split('?')[0].split('/').filter(Boolean)[0] ?? '';
    return PAGE_TITLES[segment] ?? { title: segment, section: 'WebParser' };
  });

  readonly today = new Date();
}
