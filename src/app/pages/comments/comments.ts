import {Component, signal} from '@angular/core';
import {HistoryItem} from '../../interfaces/history-item';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments {
  history = signal<HistoryItem[]>([
    {
      id: 1, user: 'user_kotov88', questionId: 1203, time: '14:30',
      statusText: 'Опубликован', statusIcon: 'pi-check', statusColor: '#84cc16'
    },
    {
      id: 2, user: 'user_marina_k', questionId: 1198, time: '14:15',
      statusText: 'Опубликован', statusIcon: 'pi-check', statusColor: '#84cc16'
    },
    {
      id: 3, user: 'user_test_03', questionId: 1195, time: '13:55',
      statusText: 'Ошибка', statusIcon: 'pi-times', statusColor: '#ef4444',
      retry: 'повтор'
    },
    {
      id: 4, user: 'user_aleksey', questionId: 1190, time: '13:40',
      statusText: 'Опубликован', statusIcon: 'pi-check', statusColor: '#84cc16'
    },
    {
      id: 5, user: 'user_svetlana', questionId: 1188, time: '13:35',
      statusText: 'Повтор через 22с', statusIcon: 'pi-refresh', statusColor: '#f59e0b'
    }
  ]);
}
