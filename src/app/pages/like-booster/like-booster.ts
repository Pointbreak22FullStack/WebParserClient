import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LogEntry} from '../../interfaces/log-entry';

@Component({
  selector: 'app-like-booster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './like-booster.html',
  styleUrl: './like-booster.css',
})
export class LikeBooster {
  actionType = signal<'like' | 'dislike'>('like');

  executionLogs = signal<LogEntry[]>([
    { id: 1, time: '14:32:01', message: 'Лайк поставлен аккаунтом kotov_88', color: '#4ade80' },
    { id: 2, time: '14:32:04', message: 'Лайк поставлен аккаунтом user_marina_k', color: '#4ade80' },
    { id: 3, time: '14:32:08', message: 'Капча на acc_03 — пропускаем', color: '#facc15' },
    { id: 4, time: '14:32:12', message: 'Лайк поставлен аккаунтом acc_01', color: '#4ade80' },
    { id: 5, time: '14:32:15', message: 'Подключение прокси 192.168.1.5...', color: '#71717a' }
  ]);
}
