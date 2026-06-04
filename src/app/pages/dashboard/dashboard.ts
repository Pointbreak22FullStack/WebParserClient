import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
// Статистика (верхние карточки)
  stats = signal([
    { label: 'В работе', value: '3', trend: '+2 с прошлого часа', trendClass: 'text-blue-500' },
    { label: 'Выполнено сегодня', value: '847', trend: '↑ 12% к вчера', trendClass: 'text-green-500' },
    { label: 'Ошибки', value: '2', trend: 'требует внимания', trendClass: 'text-red-500' },
    { label: 'Активных аккаунтов', value: '48', trend: 'из 60 всего', trendClass: 'text-zinc-500' }
  ]);

  // Активные воркеры
  workers = signal([
    { id: 1, name: 'comments / @user123', target: 'target.ru', progress: 65 },
    { id: 2, name: 'likes / @user456', target: 'post_id:8821', progress: 40 },
    { id: 3, name: 'monitor / target-site.ru', target: 'paused', progress: 0 }
  ]);

  // Очередь
  queue = signal([
    { type: 'comment', count: 245, progress: 60 },
    { type: 'like', count: 180, progress: 45 },
    { type: 'monitor', count: 12, progress: 80 }
  ]);

  // Мониторинг позиций
  positions = signal([
    { url: 'target-site.ru', rank: 3, status: 'в топ-10', statusClass: 'text-green-500 bg-green-500/10 border-green-500/20', delta: '+2', deltaClass: 'text-green-500' },
    { url: 'domain.ru', rank: 7, status: 'в топ-10', statusClass: 'text-green-500 bg-green-500/10 border-green-500/20', delta: '+1', deltaClass: 'text-green-500' },
    { url: 'example.com', rank: 14, status: 'вне топ-10', statusClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20', delta: '-3', deltaClass: 'text-red-500' }
  ]);

  // Логи
  logs = signal([
    { time: '10:42', message: 'Задача #847 выполнена успешно', class: 'text-green-500' },
    { time: '10:41', message: 'Воркер @user123 стартовал', class: 'text-blue-400' },
    { time: '10:38', message: 'Ошибка: прокси 192.168.1.1 недоступен', class: 'text-red-400' },
    { time: '10:35', message: 'Добавлено 50 комментариев', class: 'text-zinc-400' }
  ]);
}
