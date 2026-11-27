import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.html',
  styleUrl: './logs.css',
})
export class Logs {
  logs = signal([
    { id: 1, time: '10:44:02', message: 'Воркер w-03 опубликовал комментарий на YouTube', type: 'info' },
    { id: 2, time: '10:43:30', message: 'Задача #4 упала — Таймаут после 30с', type: 'error' },
    { id: 3, time: '10:42:15', message: 'Аккаунт kotov_88 успешно авторизован', type: 'success' },
    { id: 4, time: '10:40:10', message: 'Капча обнаружена на аккаунте captcha_x', type: 'warning' },
    { id: 5, time: '10:38:55', message: 'Буст: +1 лайк на youtube.com/watch?v=dQw4w9WgXcQ', type: 'boost' },
    { id: 6, time: '10:33:11', message: 'Прокси 185.4.2.11 — задержка 67мс, ОК', type: 'info' },
  ]);

  // Возвращаем только базовый цвет, а в HTML добавим префиксы bg- и text-
  getColorClass(type: string): string {
    const map: Record<string, string> = {
      info: 'zinc-500',
      error: 'red-500',
      success: 'green-500',
      warning: 'amber-500',
      boost: 'blue-500',
    };
    return map[type] || 'zinc-500';
  }

  clearLogs() {
    this.logs.set([]);
  }
}
